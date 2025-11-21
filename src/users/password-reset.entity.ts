import { Expose } from 'class-transformer';
import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('password_resets')
@Index(['email', 'code']) // Index for efficient OTP lookups
@Index(['email', 'expiresAt']) // Index for cleanup queries
export class PasswordReset {
	@ApiProperty({
		description: 'Unique identifier for the password reset request',
		example: '123e4567-e89b-12d3-a456-426614174000',
		type: 'string',
		format: 'uuid',
	})
	@PrimaryGeneratedColumn('uuid')
	@Expose()
	id: string;

	@ApiProperty({
		description: 'Email address of the user requesting password reset',
		example: 'user@example.com',
		type: 'string',
	})
	@Column()
	@Expose()
	email: string;

	@ApiProperty({
		description: 'OTP code for password reset',
		example: '123456',
		type: 'string',
	})
	@Column()
	code: string;

	@ApiProperty({
		description: 'When the OTP code expires',
		example: '2024-01-01T01:00:00.000Z',
		type: 'string',
		format: 'date-time',
	})
	@Column({ type: 'timestamp' })
	@Expose()
	expiresAt: Date;

	@ApiProperty({
		description: 'Whether this OTP has been used',
		example: false,
		type: 'boolean',
		default: false,
	})
	@Column({ default: false })
	@Expose()
	used: boolean;

	@ApiProperty({
		description: 'When the password reset request was created',
		example: '2024-01-01T00:00:00.000Z',
		type: 'string',
		format: 'date-time',
	})
	@CreateDateColumn()
	@Expose()
	createdAt: Date;
}

