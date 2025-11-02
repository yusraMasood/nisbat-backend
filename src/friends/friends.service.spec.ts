import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendsService } from './friends.service';
import { Friend, FriendStatus } from './friend.entity';
import { User } from '../users/user.entity';

describe('FriendsService', () => {
  let service: FriendsService;
  let friendRepository: Repository<Friend>;
  let userRepository: Repository<User>;

  const mockFriendRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: getRepositoryToken(Friend),
          useValue: mockFriendRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    friendRepository = module.get<Repository<Friend>>(
      getRepositoryToken(Friend),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendRequest', () => {
    it('should throw BadRequestException when trying to send request to self', async () => {
      const senderId = 'user1';
      const receiverId = 'user1';

      await expect(service.sendRequest(senderId, receiverId)).rejects.toThrow(
        'Cannot send friend request to yourself',
      );
    });

    it('should throw NotFoundException when receiver does not exist', async () => {
      const senderId = 'user1';
      const receiverId = 'user2';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.sendRequest(senderId, receiverId)).rejects.toThrow(
        'User not found',
      );
    });

    it('should create friend request successfully', async () => {
      const senderId = 'user1';
      const receiverId = 'user2';
      const mockUser = { id: receiverId, name: 'Test User' };
      const mockFriendRequest = {
        id: 'friend1',
        senderId,
        receiverId,
        status: FriendStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFriendRepository.findOne.mockResolvedValue(null);
      mockFriendRepository.create.mockReturnValue(mockFriendRequest);
      mockFriendRepository.save.mockResolvedValue(mockFriendRequest);

      const result = await service.sendRequest(senderId, receiverId);

      expect(result).toBeDefined();
      expect(result.senderId).toBe(senderId);
      expect(result.receiverId).toBe(receiverId);
      expect(result.status).toBe(FriendStatus.PENDING);
    });
  });

  describe('acceptRequest', () => {
    it('should throw NotFoundException when request does not exist', async () => {
      const requestId = 'friend1';
      const userId = 'user1';

      mockFriendRepository.findOne.mockResolvedValue(null);

      await expect(service.acceptRequest(requestId, userId)).rejects.toThrow(
        'Friend request not found',
      );
    });

    it('should accept request successfully', async () => {
      const requestId = 'friend1';
      const userId = 'user1';
      const mockRequest = {
        id: requestId,
        senderId: 'user2',
        receiverId: userId,
        status: FriendStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: 'user2',
          name: 'Sender',
          email: 'sender@test.com',
          userRole: 'FAMILY',
        },
        receiver: {
          id: 'user1',
          name: 'Receiver',
          email: 'receiver@test.com',
          userRole: 'FAMILY',
        },
      };

      mockFriendRepository.findOne.mockResolvedValue(mockRequest);
      mockFriendRepository.save.mockResolvedValue({
        ...mockRequest,
        status: FriendStatus.ACCEPTED,
      });

      const result = await service.acceptRequest(requestId, userId);

      expect(result).toBeDefined();
      expect(result.status).toBe(FriendStatus.ACCEPTED);
    });
  });
});
