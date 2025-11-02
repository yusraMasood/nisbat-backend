import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    sub: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    roles: ['USER'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn(),
        getResponse: jest.fn(),
        getNext: jest.fn(),
        getHandler: jest.fn(),
        getClass: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      } as any;
    });

    it('should return true for valid token', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      jest
        .spyOn(mockExecutionContext, 'getRequest')
        .mockReturnValue(mockRequest);
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockUser);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when no token provided', async () => {
      const mockRequest = {
        headers: {},
      };

      jest
        .spyOn(mockExecutionContext, 'getRequest')
        .mockReturnValue(mockRequest);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token format is invalid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat',
        },
      };

      jest
        .spyOn(mockExecutionContext, 'getRequest')
        .mockReturnValue(mockRequest);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };

      jest
        .spyOn(mockExecutionContext, 'getRequest')
        .mockReturnValue(mockRequest);
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle missing authorization header', async () => {
      const mockRequest = {
        headers: {},
      };

      jest
        .spyOn(mockExecutionContext, 'getRequest')
        .mockReturnValue(mockRequest);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
