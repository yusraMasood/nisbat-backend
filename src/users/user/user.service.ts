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
import { Friend, FriendStatus } from '../../friends/friend.entity';

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
		const relationships = await this.friendRepository.find({
			where: [{ senderId: userId }, { receiverId: userId }],
			select: ['senderId', 'receiverId', 'status'],
		});

		const excludedUserIds = new Set<string>([userId]);
		const statusMap = new Map<string, 'pending' | 'requested'>();

		for (const relationship of relationships) {
			const otherUserId =
				relationship.senderId === userId
					? relationship.receiverId
					: relationship.senderId;

			switch (relationship.status) {
				case FriendStatus.ACCEPTED:
				case FriendStatus.BLOCKED:
					excludedUserIds.add(otherUserId);
					break;
				case FriendStatus.PENDING:
					if (relationship.senderId === userId) {
						statusMap.set(otherUserId, 'pending');
					} else if (relationship.receiverId === userId) {
						statusMap.set(otherUserId, 'requested');
					}
					break;
				default:
					break;
			}
		}

		const suggestionUsers = await this.userRepository.find({
			where: {
				id: Not(In(Array.from(excludedUserIds))),
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

		return suggestionUsers.map((partialUser) => {
			const suggestion = this.userRepository.create(partialUser);
			suggestion.status = statusMap.get(suggestion.id) ?? 'none';
			return suggestion;
		});
	}
}
