import { Expose } from 'class-transformer';
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	Index,
	Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../users/user.entity';

export enum FriendStatus {
	PENDING = 'PENDING',
	ACCEPTED = 'ACCEPTED',
	REJECTED = 'REJECTED',
	BLOCKED = 'BLOCKED',
}

@Entity()
@Unique(['senderId', 'receiverId']) // Prevent duplicate friend requests
@Index(['senderId', 'status']) // Index for efficient queries
@Index(['receiverId', 'status']) // Index for efficient queries
export class Friend {
	@ApiProperty({
		description: 'Unique identifier for the friend request',
		example: '123e4567-e89b-12d3-a456-426614174000',
		type: 'string',
		format: 'uuid',
	})
	@PrimaryGeneratedColumn('uuid')
	@Expose()
	id: string;

	@ApiProperty({
		description: 'ID of the user who sent the friend request',
		example: '123e4567-e89b-12d3-a456-426614174000',
		type: 'string',
		format: 'uuid',
	})
	@Column()
	@Expose()
	senderId: string;

	@ApiProperty({
		description: 'ID of the user who received the friend request',
		example: '123e4567-e89b-12d3-a456-426614174001',
		type: 'string',
		format: 'uuid',
	})
	@Column()
	@Expose()
	receiverId: string;

	@ApiProperty({
		description: 'Current status of the friend request',
		enum: FriendStatus,
		example: FriendStatus.PENDING,
		default: FriendStatus.PENDING,
	})
	@Column({
		type: 'enum',
		enum: FriendStatus,
		default: FriendStatus.PENDING,
	})
	@Expose()
	status: FriendStatus;

	@ApiProperty({
		description: 'When the friend request was created',
		example: '2024-01-01T00:00:00.000Z',
		type: 'string',
		format: 'date-time',
	})
	@CreateDateColumn()
	@Expose()
	createdAt: Date;

	@ApiProperty({
		description: 'When the friend request was last updated',
		example: '2024-01-01T00:00:00.000Z',
		type: 'string',
		format: 'date-time',
	})
	@UpdateDateColumn()
	@Expose()
	updatedAt: Date;

	// Relations
	@ApiPropertyOptional({
		description: 'Information about the sender user',
		type: User,
	})
	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'senderId' })
	@Expose()
	sender: User;

	@ApiPropertyOptional({
		description: 'Information about the receiver user',
		type: User,
	})
	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'receiverId' })
	@Expose()
	receiver: User;
}
