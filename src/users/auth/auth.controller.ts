import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Post,
	SerializeOptions,
	UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../login.dto';
import { CreateUserDto } from '../create-user.dto';
import { ForgotPasswordDto } from '../forgot-password.dto';
import { LoginResponse } from '../login.response';
import { Public } from '../decorators/public.decorator';
import { AdminResponse } from '../admin.response';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../role.enum';
import { RegisterResponse } from './register.response';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
//@UseInterceptors()
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('register')
	@Public()
	async register(
		@Body() createUserDto: CreateUserDto,
	): Promise<RegisterResponse> {
		//const { user, accessToken } =
		return this.authService.register(createUserDto);
	}
	@Post('login')
	@Public()
	async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
		const accessToken = await this.authService.login(
			loginDto.email,
			loginDto.password,
		);
		return new LoginResponse({ accessToken });
	}

	@Post('forgot-password')
	@Public()
	async forgotPassword(
		@Body() forgotPasswordDto: ForgotPasswordDto,
	): Promise<{ message: string }> {
		return this.authService.forgotPassword(forgotPasswordDto.email);
	}

	@Get('admin')
	@Roles(Role.ADMIN)
	async adminOnly(): Promise<AdminResponse> {
		return new AdminResponse({ message: 'This is for admins only' });
	}
}
