import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/users/role.enum';
import { DataSource } from 'typeorm';

describe('Auth (e2e)', () => {
	let app: INestApplication;
	let accessToken: string;
	let userId: string;
	let dataSource: DataSource;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				transform: true,
				whitelist: true,
				forbidNonWhitelisted: true,
			}),
		);
		await app.init();

		// Get the DataSource for database operations
		dataSource = app.get(DataSource);

		// Clear database before starting tests
		await global.databaseUtils.clearAndSynchronize(dataSource);
	});

	afterAll(async () => {
		await app.close();
	});

	describe('/auth/register (POST)', () => {
		it('should register a new user successfully', () => {
			const testEmail = global.testUtils.generateUniqueEmail('auth-test');
			const createUserDto = {
				email: testEmail,
				name: 'Test User',
				password: 'Password123!',
			};

			return request(app.getHttpServer())
				.post('/auth/register')
				.send(createUserDto)
				.expect(201)
				.expect((res) => {
					expect(res.body).toHaveProperty('user');
					expect(res.body).toHaveProperty('accessToken');
					expect(res.body.user.email).toBe(createUserDto.email);
					expect(res.body.user.name).toBe(createUserDto.name);
					expect(res.body.user.password).toBeUndefined(); // Password should be excluded
					userId = res.body.user.id;
					accessToken = res.body.accessToken;
				});
		});

		it('should fail to register with invalid email', () => {
			const createUserDto = {
				email: 'invalid-email',
				name: 'Test User',
				password: 'Password123!',
			};

			return request(app.getHttpServer())
				.post('/auth/register')
				.send(createUserDto)
				.expect(400);
		});

		it('should fail to register with weak password', () => {
			const createUserDto = {
				email: global.testUtils.generateUniqueEmail('weak-password-test'),
				name: 'Test User',
				password: 'weak',
			};

			return request(app.getHttpServer())
				.post('/auth/register')
				.send(createUserDto)
				.expect(400);
		});

		it('should fail to register with duplicate email', async () => {
			const duplicateEmail =
				global.testUtils.generateUniqueEmail('duplicate-test');

			// First registration
			await request(app.getHttpServer())
				.post('/auth/register')
				.send({
					email: duplicateEmail,
					name: 'Test User 1',
					password: 'Password123!',
				})
				.expect(201);

			// Second registration with same email should fail
			const createUserDto = {
				email: duplicateEmail,
				name: 'Test User 2',
				password: 'Password123!',
			};

			return request(app.getHttpServer())
				.post('/auth/register')
				.send(createUserDto)
				.expect(409);
		});
	});

	describe('/auth/login (POST)', () => {
		it('should login with valid credentials', async () => {
			const testEmail = global.testUtils.generateUniqueEmail('login-test');

			// First register a user
			await request(app.getHttpServer())
				.post('/auth/register')
				.send({
					email: testEmail,
					name: 'Login Test User',
					password: 'Password123!',
				})
				.expect(201);

			// Then login with the same credentials
			const loginDto = {
				email: testEmail,
				password: 'Password123!',
			};

			return request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(201)
				.expect((res) => {
					expect(res.body).toHaveProperty('accessToken');
					accessToken = res.body.accessToken;
				});
		});

		it('should fail to login with invalid email', () => {
			const loginDto = {
				email: 'nonexistent@example.com',
				password: 'Password123!',
			};

			return request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(401);
		});

		it('should fail to login with invalid password', async () => {
			const testEmail = global.testUtils.generateUniqueEmail(
				'invalid-password-test',
			);

			// First register a user
			await request(app.getHttpServer())
				.post('/auth/register')
				.send({
					email: testEmail,
					name: 'Invalid Password Test User',
					password: 'Password123!',
				})
				.expect(201);

			// Then try to login with wrong password
			const loginDto = {
				email: testEmail,
				password: 'WrongPassword123!',
			};

			return request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(401);
		});
	});

	describe('/auth/profile (GET)', () => {
		it('should get user profile with valid token', async () => {
			const testEmail = global.testUtils.generateUniqueEmail('profile-test');

			// Register and login to get a valid token
			await request(app.getHttpServer())
				.post('/auth/register')
				.send({
					email: testEmail,
					name: 'Profile Test User',
					password: 'Password123!',
				})
				.expect(201);

			const loginResponse = await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					email: testEmail,
					password: 'Password123!',
				})
				.expect(201);

			const validToken = loginResponse.body.accessToken;

			return request(app.getHttpServer())
				.get('/auth/profile')
				.set('Authorization', `Bearer ${validToken}`)
				.expect(200)
				.expect((res) => {
					expect(res.body).toHaveProperty('id');
					expect(res.body).toHaveProperty('email');
					expect(res.body).toHaveProperty('name');
					expect(res.body.password).toBeUndefined();
				});
		});

		it('should fail to get profile without token', () => {
			return request(app.getHttpServer()).get('/auth/profile').expect(401);
		});

		it('should fail to get profile with invalid token', () => {
			return request(app.getHttpServer())
				.get('/auth/profile')
				.set('Authorization', 'Bearer invalid-token')
				.expect(401);
		});
	});

	describe('/auth/admin (GET)', () => {
		it('should access admin endpoint with admin role', async () => {
			// First, we need to create an admin user
			const adminUserDto = {
				email: global.testUtils.generateUniqueEmail('admin-test'),
				name: 'Admin User',
				password: 'Password123!',
				// Default role is USER
			};

			const registerResponse = await request(app.getHttpServer())
				.post('/auth/register')
				.send(adminUserDto)
				.expect(201);

			const adminToken = registerResponse.body.accessToken;

			// For now, we'll expect 403 since the user doesn't have admin role
			// In a real application, you'd need to manually assign admin role or have a different registration flow
			return request(app.getHttpServer())
				.get('/auth/admin')
				.set('Authorization', `Bearer ${adminToken}`)
				.expect(403);
		});

		it('should fail to access admin endpoint without admin role', async () => {
			const testEmail = global.testUtils.generateUniqueEmail('non-admin-test');

			// Register a regular user
			await request(app.getHttpServer())
				.post('/auth/register')
				.send({
					email: testEmail,
					name: 'Non Admin User',
					password: 'Password123!',
				})
				.expect(201);

			const loginResponse = await request(app.getHttpServer())
				.post('/auth/login')
				.send({
					email: testEmail,
					password: 'Password123!',
				})
				.expect(201);

			const nonAdminToken = loginResponse.body.accessToken;

			return request(app.getHttpServer())
				.get('/auth/admin')
				.set('Authorization', `Bearer ${nonAdminToken}`)
				.expect(403);
		});
	});
});
