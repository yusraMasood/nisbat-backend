import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
	@ApiProperty({ description: 'Message ID', example: 1 })
	id: number;

	@ApiProperty({
		description: 'Message content',
		example: 'Hello, how are you?',
	})
	content: string;

	@ApiProperty({
		description: 'Sender user ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	senderId: string;

	@ApiProperty({ description: 'Sender name', example: 'John Doe' })
	senderName: string;

	@ApiProperty({
		description: 'Receiver user ID',
		example: '123e4567-e89b-12d3-a456-426614174001',
	})
	receiverId: string;

	@ApiProperty({ description: 'Receiver name', example: 'Jane Smith' })
	receiverName: string;

	@ApiProperty({
		description: 'Message creation timestamp',
		example: '2025-10-14T12:00:00Z',
	})
	createdAt: Date;
}

