import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	HttpCode,
	HttpStatus,
	UseGuards,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
	ApiBadRequestResponse,
	ApiUnauthorizedResponse,
	ApiNotFoundResponse,
	ApiConflictResponse,
	ApiForbiddenResponse,
} from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { CreateFriendDto, FriendResponseDto } from './create-friend.dto';
import { FriendIdDto, UserIdDto } from './params/friend-id.dto';
import { AuthGuard } from '../users/auth.guard';
import { CurrentUserId } from '../users/decorators/current-user-id.decorator';

@ApiTags('Friends')
@Controller('friends')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({
	description: 'Unauthorized - Invalid or missing JWT token',
})
export class FriendsController {
	constructor(private readonly friendsService: FriendsService) { }

	@Post('request/:receiverId')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: 'Send friend request',
		description:
			'Send a friend request to another user. Cannot send to yourself or to users you have already sent requests to.',
	})
	@ApiParam({
		name: 'receiverId',
		description: 'UUID of the user to send friend request to',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiResponse({
		status: 201,
		description: 'Friend request sent successfully',
		type: FriendResponseDto,
	})
	@ApiBadRequestResponse({
		description: 'Cannot send friend request to yourself',
	})
	@ApiNotFoundResponse({ description: 'Target user not found' })
	@ApiConflictResponse({
		description: 'Friend request already exists or users are already friends',
	})
	@ApiForbiddenResponse({
		description: 'Cannot send friend request to blocked user',
	})
	async sendRequest(
		@CurrentUserId() senderId: string,
		@Param() params: UserIdDto,
	): Promise<FriendResponseDto> {
		return this.friendsService.sendRequest(senderId, params.userId);
	}

	@Patch('accept/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Accept friend request',
		description: 'Accept a pending friend request sent to you.',
	})
	@ApiParam({
		name: 'id',
		description: 'UUID of the friend request to accept',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiResponse({
		status: 200,
		description: 'Friend request accepted successfully',
		type: FriendResponseDto,
	})
	@ApiBadRequestResponse({ description: 'Request is not pending' })
	@ApiNotFoundResponse({ description: 'Friend request not found' })
	@ApiForbiddenResponse({
		description: 'You can only accept requests sent to you',
	})
	async acceptRequest(
		@CurrentUserId() userId: string,
		@Param() params: FriendIdDto,
	): Promise<FriendResponseDto> {
		return this.friendsService.acceptRequest(params.id, userId);
	}

	@Patch('reject/:id')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Reject friend request',
		description: 'Reject a pending friend request sent to you.',
	})
	@ApiParam({
		name: 'id',
		description: 'UUID of the friend request to reject',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiResponse({
		status: 200,
		description: 'Friend request rejected successfully',
		type: FriendResponseDto,
	})
	@ApiBadRequestResponse({ description: 'Request is not pending' })
	@ApiNotFoundResponse({ description: 'Friend request not found' })
	@ApiForbiddenResponse({
		description: 'You can only reject requests sent to you',
	})
	async rejectRequest(
		@CurrentUserId() userId: string,
		@Param() params: FriendIdDto,
	): Promise<FriendResponseDto> {
		return this.friendsService.rejectRequest(params.id, userId);
	}

	@Delete('cancel/:id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: 'Cancel friend request',
		description: 'Cancel a friend request you sent that is still pending.',
	})
	@ApiParam({
		name: 'id',
		description: 'UUID of the friend request to cancel',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiResponse({
		status: 204,
		description: 'Friend request cancelled successfully',
	})
	@ApiBadRequestResponse({ description: 'Can only cancel pending requests' })
	@ApiNotFoundResponse({ description: 'Friend request not found' })
	@ApiForbiddenResponse({
		description: 'You can only cancel your own requests',
	})
	async cancelRequest(
		@CurrentUserId() userId: string,
		@Param() params: FriendIdDto,
	): Promise<void> {
		return this.friendsService.cancelRequest(params.id, userId);
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Get friends list',
		description: 'Get list of all accepted friends for the current user.',
	})
	@ApiResponse({
		status: 200,
		description: 'List of friends retrieved successfully',
		type: [FriendResponseDto],
	})
	async getFriends(
		@CurrentUserId() userId: string,
	): Promise<FriendResponseDto[]> {
		return this.friendsService.getFriends(userId);
	}

	@Get('pending')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Get pending friend requests',
		description:
			'Get list of friend requests sent to you that are pending your response.',
	})
	@ApiResponse({
		status: 200,
		description: 'List of pending friend requests retrieved successfully',
		type: [FriendResponseDto],
	})
	async getPendingRequests(
		@CurrentUserId() userId: string,
	): Promise<FriendResponseDto[]> {
		return this.friendsService.getPendingRequests(userId);
	}

	@Get('sent')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Get sent friend requests',
		description:
			'Get list of friend requests you have sent that are still pending.',
	})
	@ApiResponse({
		status: 200,
		description: 'List of sent friend requests retrieved successfully',
		type: [FriendResponseDto],
	})
	async getSentRequests(
		@CurrentUserId() userId: string,
	): Promise<FriendResponseDto[]> {
		return this.friendsService.getSentRequests(userId);
	}

	@Get('blocked')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Get blocked users',
		description: 'Get list of users you have blocked.',
	})
	@ApiResponse({
		status: 200,
		description: 'List of blocked users retrieved successfully',
		type: [FriendResponseDto],
	})
	async getBlockedUsers(
		@CurrentUserId() userId: string,
	): Promise<FriendResponseDto[]> {
		return this.friendsService.getBlockedUsers(userId);
	}

	@Patch('block/:targetId')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary: 'Block user',
		description:
			'Block a user, preventing them from sending friend requests to you.',
	})
	@ApiParam({
		name: 'targetId',
		description: 'UUID of the user to block',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiResponse({
		status: 200,
		description: 'User blocked successfully',
		type: FriendResponseDto,
	})
	@ApiBadRequestResponse({ description: 'Cannot block yourself' })
	@ApiNotFoundResponse({ description: 'User not found' })
	async blockUser(
		@CurrentUserId() userId: string,
		@Param() params: UserIdDto,
	): Promise<FriendResponseDto> {
		return this.friendsService.blockUser(userId, params.userId);
	}

	@Delete('unblock/:targetId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: 'Unblock user',
		description:
			'Unblock a previously blocked user, allowing them to send friend requests again.',
	})
	@ApiParam({
		name: 'targetId',
		description: 'UUID of the user to unblock',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiResponse({
		status: 204,
		description: 'User unblocked successfully',
	})
	@ApiNotFoundResponse({ description: 'Blocked relationship not found' })
	async unblockUser(
		@CurrentUserId() userId: string,
		@Param() params: UserIdDto,
	): Promise<void> {
		return this.friendsService.unblockUser(userId, params.userId);
	}

	@Delete('remove/:targetId')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: 'Remove friend',
		description:
			'Remove a friend from your friends list. This will end the friendship.',
	})
	@ApiParam({
		name: 'targetId',
		description: 'UUID of the friend to remove',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiResponse({
		status: 204,
		description: 'Friend removed successfully',
	})
	@ApiNotFoundResponse({ description: 'Friendship not found' })
	async removeFriend(
		@CurrentUserId() userId: string,
		@Param() params: UserIdDto,
	): Promise<void> {
		return this.friendsService.removeFriend(userId, params.userId);
	}
}
