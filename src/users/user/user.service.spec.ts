import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../user.entity';
import { CreateUserDto } from '../create-user.dto';
import { UserRole, Role } from '../role.enum';
import { ConflictException } from '@nestjs/common';
import { PasswordService } from '../password/password.service';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
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
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return user when found', async () => {
      const email = 'john@example.com';
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(email);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const email = 'nonexistent@example.com';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findOneByEmail(email);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    });
  });

  describe('findOneById', () => {
    it('should return user when found', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findOneById(id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const id = 'nonexistent-id';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findOneById(id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'john@example.com',
        name: 'John Doe',
        password: 'Password123!',
        userRole: UserRole.FAMILY,
      };

      const hashedPassword = 'hashedPassword';
      const userToCreate = { ...mockUser, password: hashedPassword };

      jest.spyOn(passwordService, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(repository, 'create').mockReturnValue(userToCreate);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(passwordService.hash).toHaveBeenCalledWith(createUserDto.password);
      expect(repository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
        roles: [Role.USER],
      });
      expect(repository.save).toHaveBeenCalledWith(userToCreate);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        name: 'John Doe',
        password: 'Password123!',
        userRole: UserRole.FAMILY,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
