import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Repository, Not, In } from 'typeorm';
import { User } from '../user.entity';
import { PasswordService } from '../password/password.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../create-user.dto';
import { UpdateProfileDto } from '../update-profile.dto';
import { Role } from '../role.enum';
import { Friend } from '../../friends/friend.entity';
import { FriendStatus } from '../../friends/friend.entity';

{
	/*
find the user by email
create user
fetch the user by id
*/
}
@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Friend)
		private readonly friendRepository: Repository<Friend>,
		private readonly passwordService: PasswordService,
	) { }
	public async findOneByEmail(email: string): Promise<User | null> {
		return await this.userRepository.findOneBy({ email });
	}
	public async create(createUserDto: CreateUserDto): Promise<User> {
		const hashedPassword = await this.passwordService.hash(
			createUserDto.password,
		);

		const user = this.userRepository.create({
			...createUserDto,
			password: hashedPassword,
			roles: [Role.USER],
		});
		return await this.userRepository.save(user);
	}

	//public async findOneById(id: string): Promise<User | null> {
	//  return await this.userRepository.findOneBy({ id });
	//}
	async findOneById(id: string): Promise<User | null> {
		return this.userRepository.findOne({
			where: { id },
			relations: ['candidates'], // 👈 include candidate posts
		});
	}

	async updateProfile(
		userId: string,
		updateProfileDto: UpdateProfileDto,
	): Promise<User> {
		const user = await this.findOneById(userId);
		if (!user) {
			throw new NotFoundException('User not found');
		}

		// Check if email is being updated and if it's already taken
		if (updateProfileDto.email && updateProfileDto.email !== user.email) {
			const existingUser = await this.findOneByEmail(updateProfileDto.email);
			if (existingUser && existingUser.id !== userId) {
				throw new ConflictException('Email already exists');
			}
		}

		// Update only the fields that are provided
		Object.assign(user, updateProfileDto);

		return await this.userRepository.save(user);
	}

	async getSuggestions(userId: string): Promise<User[]> {
		// Get all accepted friends (both as sender and receiver)
		const friends = await this.friendRepository.find({
			where: [
				{ senderId: userId, status: FriendStatus.ACCEPTED },
				{ receiverId: userId, status: FriendStatus.ACCEPTED },
			],
		});

		// Extract friend IDs (both sender and receiver)
		const friendIds = new Set<string>();
		friendIds.add(userId); // Exclude current user

		friends.forEach((friend) => {
			if (friend.senderId === userId) {
				friendIds.add(friend.receiverId);
			} else {
				friendIds.add(friend.senderId);
			}
		});

		// Get all blocked users (should also be excluded)
		const blockedFriends = await this.friendRepository.find({
			where: [
				{ senderId: userId, status: FriendStatus.BLOCKED },
				{ receiverId: userId, status: FriendStatus.BLOCKED },
			],
		});

		blockedFriends.forEach((friend) => {
			if (friend.senderId === userId) {
				friendIds.add(friend.receiverId);
			} else {
				friendIds.add(friend.senderId);
			}
		});

		// Get users who are not friends and not blocked
		return this.userRepository.find({
			where: {
				id: Not(In(Array.from(friendIds))),
			},
			select: [
				'id',
				'name',
				'email',
				'fullName',
				'profileImage',
				'city',
				'country',
				'gender',
				'religion',
				'caste',
				'languages',
			],
		});
	}
}
