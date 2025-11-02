import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard';
import { TypedConfigService } from '../config/typed-config.service';
import { JwtPayload } from './chat.types';
import { AuthConfig } from '../config/auth.config';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	// Store active user connections: userId -> socketId
	private userSockets = new Map<string, string>();

	constructor(
		private readonly chatService: ChatService,
		private readonly jwtService: JwtService,
		private readonly configService: TypedConfigService,
	) { }

	handleConnection(client: Socket) {
		try {
			const token =
				(client.handshake.auth?.token as string) ||
				client.handshake.headers?.authorization?.replace('Bearer ', '');

			if (!token) {
				client.disconnect();
				return;
			}

			const authConfig = this.configService.get<AuthConfig>('auth');
			if (!authConfig) {
				client.disconnect();
				return;
			}
			const secret = authConfig.jwt.secret;
			const payload = this.jwtService.verify(token, {
				secret,
			});
			client.data.user = payload;

			// Store the user's socket connection
			this.userSockets.set(payload.sub, client.id);

			console.log(`User ${payload.sub} connected with socket ${client.id}`);
		} catch (err) {
			console.error('Connection error:', err);
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket) {
		const userId = client.data.user?.sub;
		if (userId) {
			this.userSockets.delete(userId);
			console.log(`User ${userId} disconnected`);
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('send_message')
	async handleSendMessage(
		@MessageBody() data: { receiverId: string; content: string },
		@ConnectedSocket() client: Socket,
	) {
		try {
			const senderId = client.data.user?.sub;
			if (!senderId) {
				client.emit('error', { message: 'Unauthorized' });
				return;
			}

			// Validate receiver exists
			const receiver = await this.chatService.findUserById(data.receiverId);
			if (!receiver) {
				client.emit('error', { message: 'Receiver not found' });
				return;
			}

			// Save message to database
			const message = await this.chatService.createMessage(
				senderId,
				data.receiverId,
				data.content,
			);

			// Emit to sender (confirmation)
			client.emit('receive_message', {
				id: message.id,
				content: message.content,
				senderId: message.sender.id,
				senderName: message.sender.name,
				receiverId: message.receiver.id,
				receiverName: message.receiver.name,
				createdAt: message.createdAt,
			});

			// Emit to receiver if they're online
			const receiverSocketId = this.userSockets.get(data.receiverId);
			if (receiverSocketId) {
				this.server.to(receiverSocketId).emit('receive_message', {
					id: message.id,
					content: message.content,
					senderId: message.sender.id,
					senderName: message.sender.name,
					receiverId: message.receiver.id,
					receiverName: message.receiver.name,
					createdAt: message.createdAt,
				});
			}

			return {
				success: true,
				messageId: message.id,
			};
		} catch (error) {
			console.error('Error sending message:', error);
			client.emit('error', { message: 'Failed to send message' });
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('get_messages')
	async handleGetMessages(
		@MessageBody() data: { otherUserId: string },
		@ConnectedSocket() client: Socket,
	) {
		try {
			const userId = client.data.user?.sub;
			if (!userId) {
				client.emit('error', { message: 'Unauthorized' });
				return;
			}

			const messages = await this.chatService.getMessagesBetweenUsers(
				userId,
				data.otherUserId,
			);

			const formattedMessages = messages.map((msg) => ({
				id: msg.id,
				content: msg.content,
				senderId: msg.sender.id,
				senderName: msg.sender.name,
				receiverId: msg.receiver.id,
				receiverName: msg.receiver.name,
				createdAt: msg.createdAt,
			}));

			client.emit('messages_list', formattedMessages);

			return {
				success: true,
				count: messages.length,
			};
		} catch (error) {
			console.error('Error getting messages:', error);
			client.emit('error', { message: 'Failed to retrieve messages' });
		}
	}
}
