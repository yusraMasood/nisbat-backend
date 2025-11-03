import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
	let dto: CreateUserDto;

	beforeEach(() => {
		dto = new CreateUserDto();
	});

	describe('email validation', () => {
		it('should pass with valid email', async () => {
			dto.email = 'test@example.com';
			dto.name = 'Test User';
			dto.password = 'Password123!';

			const errors = await validate(dto);
			const emailErrors = errors.filter((error) => error.property === 'email');
			expect(emailErrors).toHaveLength(0);
		});

		it('should fail with invalid email format', async () => {
			dto.email = 'invalid-email';
			dto.name = 'Test User';
			dto.password = 'Password123!';

			const errors = await validate(dto);
			const emailErrors = errors.filter((error) => error.property === 'email');
			expect(emailErrors).toHaveLength(1);
			expect(emailErrors[0].constraints?.isEmail).toBeDefined();
		});

		it('should fail with empty email', async () => {
			dto.email = '';
			dto.name = 'Test User';
			dto.password = 'Password123!';

			const errors = await validate(dto);
			const emailErrors = errors.filter((error) => error.property === 'email');
			expect(emailErrors).toHaveLength(1);
		});
	});

	describe('name validation', () => {
		it('should pass with valid name', async () => {
			dto.email = 'test@example.com';
			dto.name = 'Test User';
			dto.password = 'Password123!';

			const errors = await validate(dto);
			const nameErrors = errors.filter((error) => error.property === 'name');
			expect(nameErrors).toHaveLength(0);
		});

		it('should fail with empty name', async () => {
			dto.email = 'test@example.com';
			dto.name = '';
			dto.password = 'Password123!';

			const errors = await validate(dto);
			const nameErrors = errors.filter((error) => error.property === 'name');
			expect(nameErrors).toHaveLength(1);
			expect(nameErrors[0].constraints?.isNotEmpty).toBeDefined();
		});
	});

	describe('password validation', () => {
		it('should pass with valid password', async () => {
			dto.email = 'test@example.com';
			dto.name = 'Test User';
			dto.password = 'Password123!';

			const errors = await validate(dto);
			const passwordErrors = errors.filter(
				(error) => error.property === 'password',
			);
			expect(passwordErrors).toHaveLength(0);
		});

		it('should fail with password shorter than 6 characters', async () => {
			dto.email = 'test@example.com';
			dto.name = 'Test User';
			dto.password = 'Pass1!';

			const errors = await validate(dto);
			const passwordErrors = errors.filter(
				(error) => error.property === 'password',
			);
			expect(passwordErrors).toHaveLength(1);
			expect(passwordErrors[0].constraints?.minLength).toBeDefined();
		});

		it('should fail with password without uppercase letter', async () => {
			dto.email = 'test@example.com';
			dto.name = 'Test User';
			dto.password = 'password123!';

			const errors = await validate(dto);
			const passwordErrors = errors.filter(
				(error) => error.property === 'password',
			);
			expect(passwordErrors).toHaveLength(1);
			expect(passwordErrors[0].constraints?.matches).toContain(
				'uppercase letter',
			);
		});

		it('should fail with password without number', async () => {
			dto.email = 'test@example.com';
			dto.name = 'Test User';
			dto.password = 'Password!';

			const errors = await validate(dto);
			const passwordErrors = errors.filter(
				(error) => error.property === 'password',
			);
			expect(passwordErrors).toHaveLength(1);
			expect(passwordErrors[0].constraints?.matches).toContain('number');
		});

		it('should fail with password without special character', async () => {
			dto.email = 'test@example.com';
			dto.name = 'Test User';
			dto.password = 'Password123';

			const errors = await validate(dto);
			const passwordErrors = errors.filter(
				(error) => error.property === 'password',
			);
			expect(passwordErrors).toHaveLength(1);
			expect(passwordErrors[0].constraints?.matches).toContain(
				'special character',
			);
		});
	});
});
