import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { PasswordService } from '../password/password.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../create-user.dto';
import { UpdateProfileDto } from '../update-profile.dto';
import { Role } from '../role.enum';

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
}
