import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
	Gender,
	MaritalStatus,
	CandidateStatus,
} from '../src/candidates/create-candidate.dto';
import { DataSource } from 'typeorm';

describe('Candidates (e2e)', () => {
	let app: INestApplication;
	let accessToken: string;
	let userId: string;
	let candidateId: string;
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

		// Register and login a user for testing
		const createUserDto = {
			email: global.testUtils.generateUniqueEmail('candidate-test'),
			name: 'Candidate Test User',
			password: 'Password123!',
		};

		const registerResponse = await request(app.getHttpServer())
			.post('/auth/register')
			.send(createUserDto)
			.expect(201);

		userId = registerResponse.body.user.id;
		accessToken = registerResponse.body.accessToken;
	});

	afterAll(async () => {
		await app.close();
	});

	describe('/candidates (POST)', () => {
		it('should create a new candidate', () => {
			const createCandidateDto = {
				fullName: 'John Doe',
				gender: Gender.MALE,
				dob: '1990-01-01',
				maritalStatus: MaritalStatus.SINGLE,
				religion: 'Islam',
				status: CandidateStatus.PENDING,
			};

			return request(app.getHttpServer())
				.post('/candidates')
				.set('Authorization', `Bearer ${accessToken}`)
				.send(createCandidateDto)
				.expect(201)
				.expect((res) => {
					expect(res.body).toHaveProperty('id');
					expect(res.body).toHaveProperty('fullName');
					expect(res.body).toHaveProperty('userId');
					expect(res.body.fullName).toBe(createCandidateDto.fullName);
					expect(res.body.userId).toBe(userId);
					candidateId = res.body.id;
				});
		});

		it('should fail to create candidate without authentication', () => {
			const createCandidateDto = {
				fullName: 'John Doe',
				gender: Gender.MALE,
				dob: '1990-01-01',
				maritalStatus: MaritalStatus.SINGLE,
				religion: 'Islam',
				status: CandidateStatus.PENDING,
			};

			return request(app.getHttpServer())
				.post('/candidates')
				.send(createCandidateDto)
				.expect(401);
		});

		it('should fail to create candidate with invalid data', () => {
			const createCandidateDto = {
				fullName: '', // Invalid: empty name
				gender: 'INVALID_GENDER', // Invalid gender
				dob: 'invalid-date', // Invalid date
				maritalStatus: MaritalStatus.SINGLE,
				religion: 'Islam',
				status: CandidateStatus.PENDING,
			};

			return request(app.getHttpServer())
				.post('/candidates')
				.set('Authorization', `Bearer ${accessToken}`)
				.send(createCandidateDto)
				.expect(400);
		});
	});

	describe('/candidates (GET)', () => {
		it('should get all candidates for authenticated user', () => {
			return request(app.getHttpServer())
				.get('/candidates')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
				.expect((res) => {
					expect(Array.isArray(res.body)).toBe(true);
					expect(res.body.length).toBeGreaterThan(0);
					expect(res.body[0]).toHaveProperty('id');
					expect(res.body[0]).toHaveProperty('fullName');
				});
		});

		it('should fail to get candidates without authentication', () => {
			return request(app.getHttpServer()).get('/candidates').expect(401);
		});
	});

	describe('/candidates/:id (GET)', () => {
		it('should get a specific candidate', () => {
			return request(app.getHttpServer())
				.get(`/candidates/${candidateId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
				.expect((res) => {
					expect(res.body).toHaveProperty('id');
					expect(res.body).toHaveProperty('fullName');
					expect(res.body.id).toBe(candidateId);
				});
		});

		it('should fail to get candidate with invalid ID', () => {
			return request(app.getHttpServer())
				.get('/candidates/invalid-uuid')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(400);
		});

		it('should fail to get non-existent candidate', () => {
			const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
			return request(app.getHttpServer())
				.get(`/candidates/${nonExistentId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(404);
		});

		it('should fail to get candidate without authentication', () => {
			return request(app.getHttpServer())
				.get(`/candidates/${candidateId}`)
				.expect(401);
		});
	});

	describe('/candidates/:id (PATCH)', () => {
		it('should update a candidate', () => {
			const updateCandidateDto = {
				fullName: 'John Updated Doe',
				education: 'Master Degree',
				job: 'Senior Engineer',
			};

			return request(app.getHttpServer())
				.patch(`/candidates/${candidateId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.send(updateCandidateDto)
				.expect(200)
				.expect((res) => {
					expect(res.body).toHaveProperty('id');
					expect(res.body).toHaveProperty('fullName');
					expect(res.body.fullName).toBe(updateCandidateDto.fullName);
					expect(res.body.education).toBe(updateCandidateDto.education);
					expect(res.body.job).toBe(updateCandidateDto.job);
				});
		});

		it('should fail to update candidate with invalid data', () => {
			const updateCandidateDto = {
				gender: 'INVALID_GENDER', // Invalid enum value
			};

			return request(app.getHttpServer())
				.patch(`/candidates/${candidateId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.send(updateCandidateDto)
				.expect(400);
		});

		it('should fail to update candidate without authentication', () => {
			const updateCandidateDto = {
				fullName: 'John Updated Doe',
			};

			return request(app.getHttpServer())
				.patch(`/candidates/${candidateId}`)
				.send(updateCandidateDto)
				.expect(401);
		});
	});

	describe('/candidates/:id (DELETE)', () => {
		it('should delete a candidate', () => {
			return request(app.getHttpServer())
				.delete(`/candidates/${candidateId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200);
		});

		it('should fail to delete non-existent candidate', () => {
			const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
			return request(app.getHttpServer())
				.delete(`/candidates/${nonExistentId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(404);
		});

		it('should fail to delete candidate without authentication', () => {
			return request(app.getHttpServer())
				.delete(`/candidates/${candidateId}`)
				.expect(401);
		});
	});

	describe('Authorization Tests', () => {
		let anotherUserToken: string;
		let anotherUserId: string;
		let anotherCandidateId: string;

		beforeAll(async () => {
			// Create another user
			const anotherUserDto = {
				email: global.testUtils.generateUniqueEmail('another-user'),
				name: 'Another User',
				password: 'Password123!',
			};

			const registerResponse = await request(app.getHttpServer())
				.post('/auth/register')
				.send(anotherUserDto)
				.expect(201);

			anotherUserId = registerResponse.body.user.id;
			anotherUserToken = registerResponse.body.accessToken;

			// Create a candidate for the other user
			const createCandidateDto = {
				fullName: 'Another User Candidate',
				gender: Gender.FEMALE,
				dob: '1995-01-01',
				maritalStatus: MaritalStatus.SINGLE,
				religion: 'Islam',
				status: CandidateStatus.PENDING,
			};

			const candidateResponse = await request(app.getHttpServer())
				.post('/candidates')
				.set('Authorization', `Bearer ${anotherUserToken}`)
				.send(createCandidateDto)
				.expect(201);

			anotherCandidateId = candidateResponse.body.id;
		});

		it("should not allow user to access another user's candidate", () => {
			return request(app.getHttpServer())
				.get(`/candidates/${anotherCandidateId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(403);
		});

		it("should not allow user to update another user's candidate", () => {
			const updateCandidateDto = {
				fullName: 'Hacked Name',
			};

			return request(app.getHttpServer())
				.patch(`/candidates/${anotherCandidateId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.send(updateCandidateDto)
				.expect(403);
		});

		it("should not allow user to delete another user's candidate", () => {
			return request(app.getHttpServer())
				.delete(`/candidates/${anotherCandidateId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(403);
		});
	});
});
