import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FriendStatus } from './friend.entity';

export class CreateFriendDto {
	@ApiProperty({
		description: 'The UUID of the user to send a friend request to',
		example: '123e4567-e89b-12d3-a456-426614174000',
		type: 'string',
		format: 'uuid',
	})
	@IsUUID(4, { message: 'Receiver ID must be a valid UUID' })
	@IsNotEmpty({ message: 'Receiver ID is required' })
	receiverId: string;
}

export class UpdateFriendDto {
	@ApiProperty({
		description: 'The new status of the friend request',
		enum: FriendStatus,
		example: FriendStatus.ACCEPTED,
	})
	@IsEnum(FriendStatus, { message: 'Status must be a valid friend status' })
	@IsNotEmpty({ message: 'Status is required' })
	status: FriendStatus;
}

export class UserInfoDto {
	@ApiProperty({
		description: 'User ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	id: string;

	@ApiProperty({
		description: 'User name',
		example: 'John Doe',
	})
	name: string;

	@ApiProperty({
		description: 'User email',
		example: 'john.doe@example.com',
	})
	email: string;

	@ApiProperty({
		description: 'User role',
		example: 'FAMILY',
		enum: ['FAMILY', 'MATCHMAKER'],
	})
	userRole: string;
}

export class FriendResponseDto {
	@ApiProperty({
		description: 'Friend request ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	id: string;

	@ApiProperty({
		description: 'ID of the user who sent the friend request',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	senderId: string;

	@ApiProperty({
		description: 'ID of the user who received the friend request',
		example: '123e4567-e89b-12d3-a456-426614174001',
	})
	receiverId: string;

	@ApiProperty({
		description: 'Current status of the friend request',
		enum: FriendStatus,
		example: FriendStatus.PENDING,
	})
	status: FriendStatus;

	@ApiProperty({
		description: 'When the friend request was created',
		example: '2024-01-01T00:00:00.000Z',
		type: 'string',
		format: 'date-time',
	})
	createdAt: Date;

	@ApiProperty({
		description: 'When the friend request was last updated',
		example: '2024-01-01T00:00:00.000Z',
		type: 'string',
		format: 'date-time',
	})
	updatedAt: Date;

	@ApiPropertyOptional({
		description: 'Information about the sender user',
		type: UserInfoDto,
	})
	sender?: UserInfoDto;

	@ApiPropertyOptional({
		description: 'Information about the receiver user',
		type: UserInfoDto,
	})
	receiver?: UserInfoDto;
}
