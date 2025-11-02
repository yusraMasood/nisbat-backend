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
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
@UseGuards(AuthGuard)
export class UsersController {
	constructor(private readonly userService: UserService) { }

	@Get('profile')
	@ApiBearerAuth()
	async getProfile(@Request() request: AuthRequest): Promise<User> {
		const user = await this.userService.findOneById(request.user.sub);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	@Patch('profile')
	@ApiBearerAuth()
	async updateProfile(
		@Request() request: AuthRequest,
		@Body() updateProfileDto: UpdateProfileDto,
	): Promise<User> {
		return this.userService.updateProfile(
			request.user.sub,
			updateProfileDto,
		);
	}
}

