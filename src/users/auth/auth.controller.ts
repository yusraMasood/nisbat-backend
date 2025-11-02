import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../login.dto';
import { CreateUserDto } from '../create-user.dto';
import { User } from '../user.entity';
import { LoginResponse } from '../login.response';
import { UserService } from '../user/user.service';
import { Public } from '../decorators/public.decorator';
import { AdminResponse } from '../admin.response';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../role.enum';
import type { AuthRequest } from '../auth.request';
import { RegisterResponse } from './register.response';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ strategy: 'excludeAll' })
//@UseInterceptors()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

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
  @Get('profile')
  @ApiBearerAuth()
  async getProfile(@Request() request: AuthRequest): Promise<User> {
    const user = await this.userService.findOneById(request.user.sub);
    if (user) {
      return user;
    }
    throw new NotFoundException();
  }
  @Get('admin')
  @Roles(Role.ADMIN)
  async adminOnly(): Promise<AdminResponse> {
    return new AdminResponse({ message: 'This is for admins only' });
  }
}
