import {
	Injectable,
	NotFoundException,
	BadRequestException,
	ConflictException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Friend, FriendStatus } from './friend.entity';
import { User } from '../users/user.entity';
import { CreateFriendDto, FriendResponseDto } from './create-friend.dto';

@Injectable()
export class FriendsService {
	constructor(
		@InjectRepository(Friend)
		private readonly friendRepository: Repository<Friend>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) { }

	async sendRequest(
		senderId: string,
		receiverId: string,
	): Promise<FriendResponseDto> {
		// Prevent self-requests
		if (senderId === receiverId) {
			throw new BadRequestException('Cannot send friend request to yourself');
		}

		// Check if receiver exists
		const receiver = await this.userRepository.findOne({
			where: { id: receiverId },
		});
		if (!receiver) {
			throw new NotFoundException('User not found');
		}

		// Check if request already exists
		const existingRequest = await this.friendRepository.findOne({
			where: [
				{ senderId, receiverId },
				{ senderId: receiverId, receiverId: senderId },
			],
		});

		if (existingRequest) {
			if (existingRequest.status === FriendStatus.PENDING) {
				throw new ConflictException('Friend request already exists');
			}
			if (existingRequest.status === FriendStatus.ACCEPTED) {
				throw new ConflictException('Users are already friends');
			}
			if (existingRequest.status === FriendStatus.BLOCKED) {
				throw new ForbiddenException(
					'Cannot send friend request to blocked user',
				);
			}
		}

		// Create new friend request
		const friendRequest = this.friendRepository.create({
			senderId,
			receiverId,
			status: FriendStatus.PENDING,
		});

		const savedRequest = await this.friendRepository.save(friendRequest);

		return this.formatFriendResponse(savedRequest);
	}

	async acceptRequest(
		requestId: string,
		userId: string,
	): Promise<FriendResponseDto> {
		const request = await this.friendRepository.findOne({
			where: { id: requestId },
			relations: ['sender', 'receiver'],
		});

		if (!request) {
			throw new NotFoundException('Friend request not found');
		}

		if (request.receiverId !== userId) {
			throw new ForbiddenException('You can only accept requests sent to you');
		}

		if (request.status !== FriendStatus.PENDING) {
			throw new BadRequestException('Request is not pending');
		}

		request.status = FriendStatus.ACCEPTED;
		const updatedRequest = await this.friendRepository.save(request);

		return this.formatFriendResponse(updatedRequest);
	}

	async rejectRequest(
		requestId: string,
		userId: string,
	): Promise<FriendResponseDto> {
		const request = await this.friendRepository.findOne({
			where: { id: requestId },
			relations: ['sender', 'receiver'],
		});

		if (!request) {
			throw new NotFoundException('Friend request not found');
		}

		if (request.receiverId !== userId) {
			throw new ForbiddenException('You can only reject requests sent to you');
		}

		if (request.status !== FriendStatus.PENDING) {
			throw new BadRequestException('Request is not pending');
		}

		request.status = FriendStatus.REJECTED;
		const updatedRequest = await this.friendRepository.save(request);

		return this.formatFriendResponse(updatedRequest);
	}

	async cancelRequest(requestId: string, userId: string): Promise<void> {
		const request = await this.friendRepository.findOne({
			where: { id: requestId },
		});

		if (!request) {
			throw new NotFoundException('Friend request not found');
		}

		if (request.senderId !== userId) {
			throw new ForbiddenException('You can only cancel your own requests');
		}

		if (request.status !== FriendStatus.PENDING) {
			throw new BadRequestException('Can only cancel pending requests');
		}

		await this.friendRepository.remove(request);
	}

	async getFriends(userId: string): Promise<FriendResponseDto[]> {
		const friends = await this.friendRepository.find({
			where: [
				{ senderId: userId, status: FriendStatus.ACCEPTED },
				{ receiverId: userId, status: FriendStatus.ACCEPTED },
			],
			relations: ['sender', 'receiver'],
			order: { updatedAt: 'DESC' },
		});

		return friends.map((friend) => this.formatFriendResponse(friend));
	}

	async getPendingRequests(userId: string): Promise<FriendResponseDto[]> {
		const requests = await this.friendRepository.find({
			where: { receiverId: userId, status: FriendStatus.PENDING },
			relations: ['sender'],
			order: { createdAt: 'DESC' },
		});

		return requests.map((request) => this.formatFriendResponse(request));
	}

	async getSentRequests(userId: string): Promise<FriendResponseDto[]> {
		const requests = await this.friendRepository.find({
			where: { senderId: userId, status: FriendStatus.PENDING },
			relations: ['receiver'],
			order: { createdAt: 'DESC' },
		});

		return requests.map((request) => this.formatFriendResponse(request));
	}

	async blockUser(
		userId: string,
		targetId: string,
	): Promise<FriendResponseDto> {
		// Prevent self-blocking
		if (userId === targetId) {
			throw new BadRequestException('Cannot block yourself');
		}

		// Check if target user exists
		const targetUser = await this.userRepository.findOne({
			where: { id: targetId },
		});
		if (!targetUser) {
			throw new NotFoundException('User not found');
		}

		// Find existing relationship
		let relationship = await this.friendRepository.findOne({
			where: [
				{ senderId: userId, receiverId: targetId },
				{ senderId: targetId, receiverId: userId },
			],
		});

		if (relationship) {
			relationship.status = FriendStatus.BLOCKED;
			// Update the sender/receiver to ensure userId is always the blocker
			if (relationship.receiverId === userId) {
				relationship.senderId = targetId;
				relationship.receiverId = userId;
			}
		} else {
			relationship = this.friendRepository.create({
				senderId: userId,
				receiverId: targetId,
				status: FriendStatus.BLOCKED,
			});
		}

		const savedRelationship = await this.friendRepository.save(relationship);
		return this.formatFriendResponse(savedRelationship);
	}

	async removeFriend(userId: string, targetId: string): Promise<void> {
		const relationship = await this.friendRepository.findOne({
			where: [
				{
					senderId: userId,
					receiverId: targetId,
					status: FriendStatus.ACCEPTED,
				},
				{
					senderId: targetId,
					receiverId: userId,
					status: FriendStatus.ACCEPTED,
				},
			],
		});

		if (!relationship) {
			throw new NotFoundException('Friendship not found');
		}

		await this.friendRepository.remove(relationship);
	}

	async getBlockedUsers(userId: string): Promise<FriendResponseDto[]> {
		const blocked = await this.friendRepository.find({
			where: { senderId: userId, status: FriendStatus.BLOCKED },
			relations: ['receiver'],
			order: { updatedAt: 'DESC' },
		});

		return blocked.map((relationship) =>
			this.formatFriendResponse(relationship),
		);
	}

	async unblockUser(userId: string, targetId: string): Promise<void> {
		const relationship = await this.friendRepository.findOne({
			where: {
				senderId: userId,
				receiverId: targetId,
				status: FriendStatus.BLOCKED,
			},
		});

		if (!relationship) {
			throw new NotFoundException('Blocked relationship not found');
		}

		await this.friendRepository.remove(relationship);
	}

	private formatFriendResponse(friend: Friend): FriendResponseDto {
		return {
			id: friend.id,
			senderId: friend.senderId,
			receiverId: friend.receiverId,
			status: friend.status,
			createdAt: friend.createdAt,
			updatedAt: friend.updatedAt,
			sender: friend.sender
				? {
					id: friend.sender.id,
					name: friend.sender.name,
					email: friend.sender.email,
					userRole: friend.sender.userRole,
				}
				: undefined,
			receiver: friend.receiver
				? {
					id: friend.receiver.id,
					name: friend.receiver.name,
					email: friend.receiver.email,
					userRole: friend.receiver.userRole,
				}
				: undefined,
		};
	}
}
