import { validate } from 'class-validator';
import { UserIdDto } from './user-id.dto';

describe('UserIdDto', () => {
	let dto: UserIdDto;

	beforeEach(() => {
		dto = new UserIdDto();
	});

	describe('id validation', () => {
		it('should pass with valid UUID v4', async () => {
			dto.id = '123e4567-e89b-12d3-a456-426614174000';

			const errors = await validate(dto);
			expect(errors).toHaveLength(0);
		});

		it('should pass with another valid UUID v4', async () => {
			dto.id = '550e8400-e29b-41d4-a716-446655440000';

			const errors = await validate(dto);
			expect(errors).toHaveLength(0);
		});

		it('should fail with invalid UUID format', async () => {
			dto.id = 'invalid-uuid';

			const errors = await validate(dto);
			expect(errors).toHaveLength(1);
			expect(errors[0].constraints?.isUuid).toBeDefined();
		});

		it('should fail with UUID v1 (not v4)', async () => {
			dto.id = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // UUID v1

			const errors = await validate(dto);
			expect(errors).toHaveLength(1);
			expect(errors[0].constraints?.isUuid).toBeDefined();
		});

		it('should fail with empty string', async () => {
			dto.id = '';

			const errors = await validate(dto);
			expect(errors).toHaveLength(1);
			expect(errors[0].constraints?.isUuid).toBeDefined();
		});

		it('should fail with null', async () => {
			dto.id = null as any;

			const errors = await validate(dto);
			expect(errors).toHaveLength(1);
			expect(errors[0].constraints?.isUuid).toBeDefined();
		});

		it('should fail with undefined', async () => {
			dto.id = undefined as any;

			const errors = await validate(dto);
			expect(errors).toHaveLength(1);
			expect(errors[0].constraints?.isUuid).toBeDefined();
		});
	});
});
