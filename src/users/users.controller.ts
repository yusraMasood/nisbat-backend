import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	NotFoundException,
	Patch,
	Request,
	SerializeOptions,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user/user.service';
import { User } from './user.entity';
import type { AuthRequest } from './auth.request';
import { UpdateProfileDto } from './update-profile.dto';
import { AuthGuard } from './auth.guard';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@UseGuards(AuthGuard)
export class UsersController {
	constructor(private readonly userService: UserService) { }

	@Get('profile')
	async getProfile(@Request() request: AuthRequest): Promise<User> {
		const user = await this.userService.findOneById(request.user.sub);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	@Patch('profile')
	async updateProfile(
		@Request() request: AuthRequest,
		@Body() updateProfileDto: UpdateProfileDto,
	): Promise<User> {
		return this.userService.updateProfile(request.user.sub, updateProfileDto);
	}

	@Get('suggestions')
	@SerializeOptions({ groups: ['suggestions'], strategy: 'excludeAll' })
	async getSuggestions(@Request() request: AuthRequest): Promise<User[]> {
		return this.userService.getSuggestions(request.user.sub);
	}
}
