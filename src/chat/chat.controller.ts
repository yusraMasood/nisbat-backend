import {
	Controller,
	Post,
	Get,
	Body,
	Param,
	UseGuards,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { AuthGuard } from '../users/auth.guard';
import { CurrentUserId } from '../users/decorators/current-user-id.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) { }

	@Post('messages')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Send a message',
		description: 'Send a message to another user via REST API',
	})
	@ApiResponse({
		status: 201,
		description: 'Message sent successfully',
		type: MessageResponseDto,
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 404, description: 'Receiver not found' })
	async sendMessage(
		@CurrentUserId() senderId: string,
		@Body() sendMessageDto: SendMessageDto,
	): Promise<MessageResponseDto> {
		const receiver = await this.chatService.findUserById(
			sendMessageDto.receiverId,
		);

		if (!receiver) {
			throw new Error('Receiver not found');
		}

		const message = await this.chatService.createMessage(
			senderId,
			sendMessageDto.receiverId,
			sendMessageDto.content,
		);

		return {
			id: message.id,
			content: message.content,
			senderId: message.sender.id,
			senderName: message.sender.name,
			receiverId: message.receiver.id,
			receiverName: message.receiver.name,
			createdAt: message.createdAt,
		};
	}

	@Get('messages/:otherUserId')
	@ApiOperation({
		summary: 'Get conversation with a user',
		description:
			'Retrieve all messages between the current user and another user',
	})
	@ApiParam({
		name: 'otherUserId',
		description: 'The UUID of the other user',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiResponse({
		status: 200,
		description: 'Messages retrieved successfully',
		type: [MessageResponseDto],
	})
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async getMessages(
		@CurrentUserId() userId: string,
		@Param('otherUserId') otherUserId: string,
	): Promise<MessageResponseDto[]> {
		const messages = await this.chatService.getMessagesBetweenUsers(
			userId,
			otherUserId,
		);

		return messages.map((msg) => ({
			id: msg.id,
			content: msg.content,
			senderId: msg.sender.id,
			senderName: msg.sender.name,
			receiverId: msg.receiver.id,
			receiverName: msg.receiver.name,
			createdAt: msg.createdAt,
		}));
	}

	@Get('info')
	@ApiOperation({
		summary: 'Get WebSocket connection info',
		description:
			'Returns information about how to connect to the WebSocket server for real-time chat',
	})
	@ApiResponse({
		status: 200,
		description: 'WebSocket connection information',
		schema: {
			type: 'object',
			properties: {
				websocketUrl: { type: 'string', example: 'http://localhost:3000' },
				events: {
					type: 'object',
					properties: {
						send_message: {
							type: 'object',
							properties: {
								description: { type: 'string' },
								payload: { type: 'object' },
							},
						},
						get_messages: {
							type: 'object',
							properties: {
								description: { type: 'string' },
								payload: { type: 'object' },
							},
						},
						receive_message: {
							type: 'object',
							properties: {
								description: { type: 'string' },
								payload: { type: 'object' },
							},
						},
					},
				},
			},
		},
	})
	getWebSocketInfo() {
		return {
			websocketUrl: process.env.WEBSOCKET_URL || 'http://localhost:3000',
			description:
				'Connect to this URL using Socket.io client with JWT token in auth',
			authentication: {
				type: 'Bearer Token',
				location: 'socket.handshake.auth.token',
				example: {
					auth: {
						token: 'your-jwt-token',
					},
				},
			},
			events: {
				send_message: {
					description: 'Send a message to another user',
					direction: 'client -> server',
					payload: {
						receiverId: 'string (UUID)',
						content: 'string',
					},
					emits: 'receive_message (to both sender and receiver)',
				},
				get_messages: {
					description: 'Get conversation history with another user',
					direction: 'client -> server',
					payload: {
						otherUserId: 'string (UUID)',
					},
					emits: 'messages_list',
				},
				receive_message: {
					description: 'Receive a new message in real-time',
					direction: 'server -> client',
					payload: {
						id: 'number',
						content: 'string',
						senderId: 'string',
						senderName: 'string',
						receiverId: 'string',
						receiverName: 'string',
						createdAt: 'Date',
					},
				},
				messages_list: {
					description: 'List of messages in conversation',
					direction: 'server -> client',
					payload: 'Array<Message>',
				},
			},
		};
	}
}

