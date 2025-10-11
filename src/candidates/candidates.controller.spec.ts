import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto, Gender, MaritalStatus, CandidateStatus } from './create-candidate.dto';
import { UpdateCandidateDto } from './update-candidate.dto';
import { Candidate } from './candidate.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CandidatesController', () => {
	let controller: CandidatesController;
	let service: CandidatesService;

	const mockCandidate: Candidate = {
		id: '123e4567-e89b-12d3-a456-426614174000',
		fullName: 'John Doe',
		image: 'image.jpg',
		gender: Gender.MALE,
		dob: new Date('1990-01-01'),
		maritalStatus: MaritalStatus.SINGLE,
		height: '5\'10"',
		religion: 'Islam',
		caste: 'Syed',
		language: 'Urdu',
		education: 'Bachelor',
		job: 'Engineer',
		income: '50000',
		preferredAge: '25-30',
		preferredHeight: '5\'6"-6\'0"',
		preferredEducation: 'Bachelor',
		preferredCaste: 'Any',
		preferredLanguage: 'Urdu',
		otherPreferred: 'Good character',
		preferredLocation: 'Karachi',
		status: CandidateStatus.PENDING,
		userId: 'user-123',
		user: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const mockUserId = 'user-123';

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [CandidatesController],
			providers: [
				{
					provide: CandidatesService,
					useValue: {
						getCandidates: jest.fn(),
						create: jest.fn(),
						getCandidate: jest.fn(),
						update: jest.fn(),
						remove: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<CandidatesController>(CandidatesController);
		service = module.get<CandidatesService>(CandidatesService);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	describe('getCandidates', () => {
		it('should return all candidates for a user', async () => {
			const mockCandidates = [mockCandidate];
			jest.spyOn(service, 'getCandidates').mockResolvedValue(mockCandidates);

			const result = await controller.getCandidates(mockUserId);

			expect(service.getCandidates).toHaveBeenCalledWith(mockUserId);
			expect(result).toEqual(mockCandidates);
		});
	});

	describe('create', () => {
		it('should create a new candidate', async () => {
			const createCandidateDto: CreateCandidateDto = {
				fullName: 'John Doe',
				gender: Gender.MALE,
				dob: '1990-01-01',
				maritalStatus: MaritalStatus.SINGLE,
				religion: 'Islam',
				status: CandidateStatus.PENDING,
				userId: mockUserId,
			};

			jest.spyOn(service, 'create').mockResolvedValue(mockCandidate);

			const result = await controller.create(createCandidateDto, mockUserId);

			expect(service.create).toHaveBeenCalledWith({
				...createCandidateDto,
				userId: mockUserId,
			});
			expect(result).toEqual(mockCandidate);
		});
	});

	describe('getCandidate', () => {
		it('should return a specific candidate', async () => {
			const candidateId = '123e4567-e89b-12d3-a456-426614174000';
			jest.spyOn(service, 'getCandidate').mockResolvedValue(mockCandidate);

			const result = await controller.getCandidate({ id: candidateId }, mockUserId);

			expect(service.getCandidate).toHaveBeenCalledWith(candidateId, mockUserId);
			expect(result).toEqual(mockCandidate);
		});

		it('should throw NotFoundException when candidate not found', async () => {
			const candidateId = 'nonexistent-id';
			jest.spyOn(service, 'getCandidate').mockRejectedValue(
				new NotFoundException(`Candidate ${candidateId} not found`),
			);

			await expect(controller.getCandidate({ id: candidateId }, mockUserId)).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should throw ForbiddenException when user is not authorized', async () => {
			const candidateId = '123e4567-e89b-12d3-a456-426614174000';
			jest.spyOn(service, 'getCandidate').mockRejectedValue(
				new ForbiddenException('You are not allowed to do this action'),
			);

			await expect(controller.getCandidate({ id: candidateId }, mockUserId)).rejects.toThrow(
				ForbiddenException,
			);
		});
	});

	describe('update', () => {
		it('should update a candidate', async () => {
			const candidateId = '123e4567-e89b-12d3-a456-426614174000';
			const updateCandidateDto: UpdateCandidateDto = {
				fullName: 'John Updated',
				education: 'Master',
			};

			const updatedCandidate = { ...mockCandidate, ...updateCandidateDto };
			jest.spyOn(service, 'update').mockResolvedValue(updatedCandidate);

			const result = await controller.update(
				{ id: candidateId },
				updateCandidateDto,
				mockUserId,
			);

			expect(service.update).toHaveBeenCalledWith(candidateId, updateCandidateDto, mockUserId);
			expect(result).toEqual(updatedCandidate);
		});
	});

	describe('remove', () => {
		it('should remove a candidate', async () => {
			const candidateId = '123e4567-e89b-12d3-a456-426614174000';
			jest.spyOn(service, 'remove').mockResolvedValue(undefined);

			await controller.remove({ id: candidateId }, mockUserId);

			expect(service.remove).toHaveBeenCalledWith(candidateId, mockUserId);
		});
	});
});
