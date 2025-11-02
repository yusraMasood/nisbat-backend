import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
	@ApiProperty({
		description: 'The UUID of the user receiving the message',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@IsNotEmpty()
	@IsUUID()
	receiverId: string;

	@ApiProperty({
		description: 'The content of the message',
		example: 'Hello, how are you?',
	})
	@IsNotEmpty()
	@IsString()
	content: string;
}

