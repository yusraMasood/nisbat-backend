import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController', () => {
	let controller: ChatController;
	let service: ChatService;

	const mockChatService = {
		createMessage: jest.fn(),
		getMessagesBetweenUsers: jest.fn(),
		findUserById: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ChatController],
			providers: [
				{
					provide: ChatService,
					useValue: mockChatService,
				},
			],
		}).compile();

		controller = module.get<ChatController>(ChatController);
		service = module.get<ChatService>(ChatService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('sendMessage', () => {
		it('should send a message successfully', async () => {
			const mockMessage = {
				id: 1,
				content: 'Test message',
				sender: { id: 'user1', name: 'User 1' },
				receiver: { id: 'user2', name: 'User 2' },
				createdAt: new Date(),
			};

			mockChatService.findUserById.mockResolvedValue({ id: 'user2' });
			mockChatService.createMessage.mockResolvedValue(mockMessage);

			const result = await controller.sendMessage('user1', {
				receiverId: 'user2',
				content: 'Test message',
			});

			expect(result).toEqual({
				id: 1,
				content: 'Test message',
				senderId: 'user1',
				senderName: 'User 1',
				receiverId: 'user2',
				receiverName: 'User 2',
				createdAt: mockMessage.createdAt,
			});
		});
	});

	describe('getMessages', () => {
		it('should get messages between two users', async () => {
			const mockMessages = [
				{
					id: 1,
					content: 'Message 1',
					sender: { id: 'user1', name: 'User 1' },
					receiver: { id: 'user2', name: 'User 2' },
					createdAt: new Date(),
				},
			];

			mockChatService.getMessagesBetweenUsers.mockResolvedValue(mockMessages);

			const result = await controller.getMessages('user1', 'user2');

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveProperty('id');
			expect(result[0]).toHaveProperty('content');
		});
	});
});

