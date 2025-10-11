import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from './role.enum';

describe('RolesGuard', () => {
	let guard: RolesGuard;
	let reflector: Reflector;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RolesGuard,
				{
					provide: Reflector,
					useValue: {
						getAllAndOverride: jest.fn(),
					},
				},
			],
		}).compile();

		guard = module.get<RolesGuard>(RolesGuard);
		reflector = module.get<Reflector>(Reflector);
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

		it('should return true when no roles are required', async () => {
			const mockRequest = {
				user: {
					sub: '123e4567-e89b-12d3-a456-426614174000',
					name: 'John Doe',
					roles: [Role.USER],
				},
			};

			jest.spyOn(mockExecutionContext, 'getRequest').mockReturnValue(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

			const result = await guard.canActivate(mockExecutionContext);

			expect(result).toBe(true);
		});

		it('should return true when user has required role', async () => {
			const mockRequest = {
				user: {
					sub: '123e4567-e89b-12d3-a456-426614174000',
					name: 'John Doe',
					roles: [Role.ADMIN],
				},
			};

			jest.spyOn(mockExecutionContext, 'getRequest').mockReturnValue(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

			const result = await guard.canActivate(mockExecutionContext);

			expect(result).toBe(true);
		});

		it('should return true when user has one of the required roles', async () => {
			const mockRequest = {
				user: {
					sub: '123e4567-e89b-12d3-a456-426614174000',
					name: 'John Doe',
					roles: [Role.USER, Role.ADMIN],
				},
			};

			jest.spyOn(mockExecutionContext, 'getRequest').mockReturnValue(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN, Role.MODERATOR]);

			const result = await guard.canActivate(mockExecutionContext);

			expect(result).toBe(true);
		});

		it('should throw ForbiddenException when user does not have required role', async () => {
			const mockRequest = {
				user: {
					sub: '123e4567-e89b-12d3-a456-426614174000',
					name: 'John Doe',
					roles: [Role.USER],
				},
			};

			jest.spyOn(mockExecutionContext, 'getRequest').mockReturnValue(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

			await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
				ForbiddenException,
			);
		});

		it('should throw ForbiddenException when user has no roles', async () => {
			const mockRequest = {
				user: {
					sub: '123e4567-e89b-12d3-a456-426614174000',
					name: 'John Doe',
					roles: [],
				},
			};

			jest.spyOn(mockExecutionContext, 'getRequest').mockReturnValue(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

			await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
				ForbiddenException,
			);
		});

		it('should throw ForbiddenException when user is not authenticated', async () => {
			const mockRequest = {};

			jest.spyOn(mockExecutionContext, 'getRequest').mockReturnValue(mockRequest);
			jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

			await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
				ForbiddenException,
			);
		});
	});
});
