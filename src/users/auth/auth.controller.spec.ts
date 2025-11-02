import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../create-user.dto';
import { LoginDto } from '../login.dto';
import { User } from '../user.entity';
import { UserRole, Role } from '../role.enum';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { RegisterResponse } from './register.response';
import { LoginResponse } from '../login.response';
import { AdminResponse } from '../admin.response';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    candidates: [],
    roles: [Role.USER],
    userRole: UserRole.FAMILY,
  };

  const mockAuthRequest = {
    user: {
      sub: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      roles: [Role.USER],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'john@example.com',
        name: 'John Doe',
        password: 'Password123!',
        userRole: UserRole.FAMILY,
      };

      const mockRegisterResponse = new RegisterResponse({
        user: mockUser,
        accessToken: 'mock-jwt-token',
      });

      jest
        .spyOn(authService, 'register')
        .mockResolvedValue(mockRegisterResponse);

      const result = await controller.register(createUserDto);

      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockRegisterResponse);
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        name: 'John Doe',
        password: 'Password123!',
        userRole: UserRole.FAMILY,
      };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new ConflictException('Email already exists'));

      await expect(controller.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'Password123!',
      };

      const mockAccessToken = 'mock-jwt-token';
      jest.spyOn(authService, 'login').mockResolvedValue(mockAccessToken);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(result).toEqual(
        new LoginResponse({ accessToken: mockAccessToken }),
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid Credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      jest.spyOn(userService, 'findOneById').mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockAuthRequest);

      expect(userService.findOneById).toHaveBeenCalledWith(
        mockAuthRequest.user.sub,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userService, 'findOneById').mockResolvedValue(null);

      await expect(controller.getProfile(mockAuthRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('adminOnly', () => {
    it('should return admin response', async () => {
      const result = await controller.adminOnly();

      expect(result).toEqual(
        new AdminResponse({ message: 'This is for admins only' }),
      );
    });
  });
});
