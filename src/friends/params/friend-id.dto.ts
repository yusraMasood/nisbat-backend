import { IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FriendIdDto {
	@ApiProperty({
		description: 'The UUID of the friend request',
		example: '123e4567-e89b-12d3-a456-426614174000',
		type: 'string',
		format: 'uuid',
	})
	@Transform(({ value }) => value.trim())
	@IsUUID(4, { message: 'Friend ID must be a valid UUID' })
	id: string;
}

export class UserIdDto {
	@IsUUID(4, { message: 'User ID must be a valid UUID' })
	@ApiProperty()
	userId: string;
}
