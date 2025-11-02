import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { FriendStatus } from './friend.entity';

describe('FriendsController', () => {
  let controller: FriendsController;
  let service: FriendsService;

  const mockFriendsService = {
    sendRequest: jest.fn(),
    acceptRequest: jest.fn(),
    rejectRequest: jest.fn(),
    cancelRequest: jest.fn(),
    getFriends: jest.fn(),
    getPendingRequests: jest.fn(),
    getSentRequests: jest.fn(),
    getBlockedUsers: jest.fn(),
    blockUser: jest.fn(),
    unblockUser: jest.fn(),
    removeFriend: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [
        {
          provide: FriendsService,
          useValue: mockFriendsService,
        },
      ],
    }).compile();

    controller = module.get<FriendsController>(FriendsController);
    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendRequest', () => {
    it('should send friend request', async () => {
      const senderId = 'user1';
      const receiverId = 'user2';
      const mockResponse = {
        id: 'friend1',
        senderId,
        receiverId,
        status: FriendStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFriendsService.sendRequest.mockResolvedValue(mockResponse);

      const result = await controller.sendRequest(senderId, {
        userId: receiverId,
      });

      expect(result).toEqual(mockResponse);
      expect(mockFriendsService.sendRequest).toHaveBeenCalledWith(
        senderId,
        receiverId,
      );
    });
  });

  describe('acceptRequest', () => {
    it('should accept friend request', async () => {
      const userId = 'user1';
      const requestId = 'friend1';
      const mockResponse = {
        id: requestId,
        senderId: 'user2',
        receiverId: userId,
        status: FriendStatus.ACCEPTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockFriendsService.acceptRequest.mockResolvedValue(mockResponse);

      const result = await controller.acceptRequest(userId, { id: requestId });

      expect(result).toEqual(mockResponse);
      expect(mockFriendsService.acceptRequest).toHaveBeenCalledWith(
        requestId,
        userId,
      );
    });
  });

  describe('getFriends', () => {
    it('should get friends list', async () => {
      const userId = 'user1';
      const mockFriends = [
        {
          id: 'friend1',
          senderId: 'user1',
          receiverId: 'user2',
          status: FriendStatus.ACCEPTED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockFriendsService.getFriends.mockResolvedValue(mockFriends);

      const result = await controller.getFriends(userId);

      expect(result).toEqual(mockFriends);
      expect(mockFriendsService.getFriends).toHaveBeenCalledWith(userId);
    });
  });
});
