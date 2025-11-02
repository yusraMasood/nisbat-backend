import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../password/password.service';
import { CreateUserDto } from '../create-user.dto';
import { User } from '../user.entity';
import { UserRole, Role } from '../role.enum';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterResponse } from './register.response';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let passwordService: PasswordService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'john@example.com',
        name: 'John Doe',
        password: 'Password123!',
        userRole: UserRole.FAMILY,
      };

      const mockAccessToken = 'mock-jwt-token';

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockAccessToken);

      const result = await service.register(createUserDto);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        name: mockUser.name,
        roles: mockUser.roles,
      });
      expect(result).toEqual(
        new RegisterResponse({ user: mockUser, accessToken: mockAccessToken }),
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        name: 'John Doe',
        password: 'Password123!',
        userRole: UserRole.FAMILY,
      };

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);

      await expect(service.register(createUserDto)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const email = 'john@example.com';
      const password = 'Password123!';
      const mockAccessToken = 'mock-jwt-token';

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(passwordService, 'verify').mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(mockAccessToken);

      const result = await service.login(email, password);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(email);
      expect(passwordService.verify).toHaveBeenCalledWith(
        password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        name: mockUser.name,
        roles: mockUser.roles,
      });
      expect(result).toBe(mockAccessToken);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'Password123!';

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        new UnauthorizedException('Invalid Credentials'),
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const email = 'john@example.com';
      const password = 'wrongpassword';

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(passwordService, 'verify').mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(
        new UnauthorizedException('Invalid Password'),
      );
    });
  });
});
