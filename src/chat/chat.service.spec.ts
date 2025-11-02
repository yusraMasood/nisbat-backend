import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { Message } from './message.entity';
import { User } from '../users/user.entity';

describe('ChatService', () => {
  let service: ChatService;
  let messageRepository: Repository<Message>;
  let userRepository: Repository<User>;

  const mockUser1 = {
    id: 'user1-uuid',
    name: 'User 1',
    email: 'user1@example.com',
  };

  const mockUser2 = {
    id: 'user2-uuid',
    name: 'User 2',
    email: 'user2@example.com',
  };

  const mockMessage = {
    id: 1,
    sender: mockUser1,
    receiver: mockUser2,
    content: 'Test message',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Message),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    messageRepository = module.get<Repository<Message>>(
      getRepositoryToken(Message),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMessage', () => {
    it('should create a message between two users', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(mockUser1 as User);
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(mockUser2 as User);
      jest
        .spyOn(messageRepository, 'create')
        .mockReturnValue(mockMessage as Message);
      jest
        .spyOn(messageRepository, 'save')
        .mockResolvedValue(mockMessage as Message);

      const result = await service.createMessage(
        'user1-uuid',
        'user2-uuid',
        'Test message',
      );

      expect(result).toEqual(mockMessage);
      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
      expect(messageRepository.create).toHaveBeenCalled();
      expect(messageRepository.save).toHaveBeenCalled();
    });

    it('should throw error if sender not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.createMessage('invalid-id', 'user2-uuid', 'Test'),
      ).rejects.toThrow('Sender or receiver not found');
    });
  });

  describe('findUserById', () => {
    it('should find a user by id', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser1 as User);

      const result = await service.findUserById('user1-uuid');

      expect(result).toEqual(mockUser1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user1-uuid' },
      });
    });
  });
});
