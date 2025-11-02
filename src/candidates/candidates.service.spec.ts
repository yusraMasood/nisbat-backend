import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CandidatesService } from './candidates.service';
import {
  CreateCandidateDto,
  Gender,
  MaritalStatus,
  CandidateStatus,
} from './create-candidate.dto';
import { UpdateCandidateDto } from './update-candidate.dto';
import { Candidate } from './candidate.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CandidatesService', () => {
  let service: CandidatesService;
  let repository: Repository<Candidate>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatesService,
        {
          provide: getRepositoryToken(Candidate),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
    repository = module.get<Repository<Candidate>>(
      getRepositoryToken(Candidate),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCandidates', () => {
    it('should return all candidates for a user', async () => {
      const userId = 'user-123';
      const mockCandidates = [mockCandidate];
      jest.spyOn(repository, 'find').mockResolvedValue(mockCandidates);

      const result = await service.getCandidates(userId);

      expect(repository.find).toHaveBeenCalledWith({ where: { userId } });
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
        userId: 'user-123',
      };

      jest.spyOn(repository, 'save').mockResolvedValue(mockCandidate);

      const result = await service.create(createCandidateDto);

      expect(repository.save).toHaveBeenCalledWith(createCandidateDto);
      expect(result).toEqual(mockCandidate);
    });
  });

  describe('getCandidate', () => {
    it('should return a candidate when found and user is authorized', async () => {
      const candidateId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user-123';
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCandidate);

      const result = await service.getCandidate(candidateId, userId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: candidateId },
      });
      expect(result).toEqual(mockCandidate);
    });

    it('should throw NotFoundException when candidate not found', async () => {
      const candidateId = 'nonexistent-id';
      const userId = 'user-123';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getCandidate(candidateId, userId)).rejects.toThrow(
        new NotFoundException(`Candidate ${candidateId} not found`),
      );
    });

    it('should throw ForbiddenException when user is not authorized', async () => {
      const candidateId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'different-user';
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockCandidate);

      await expect(service.getCandidate(candidateId, userId)).rejects.toThrow(
        new ForbiddenException('You are not allowed to do this action'),
      );
    });
  });

  describe('update', () => {
    it('should update a candidate successfully', async () => {
      const candidateId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user-123';
      const updateDto: UpdateCandidateDto = {
        fullName: 'John Updated',
        education: 'Master',
      };

      const updatedCandidate = { ...mockCandidate, ...updateDto };

      jest.spyOn(service, 'getCandidate').mockResolvedValue(mockCandidate);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedCandidate);

      const result = await service.update(candidateId, updateDto, userId);

      expect(service.getCandidate).toHaveBeenCalledWith(candidateId, userId);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
      expect(result).toEqual(updatedCandidate);
    });
  });

  describe('remove', () => {
    it('should remove a candidate successfully', async () => {
      const candidateId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user-123';

      jest.spyOn(service, 'getCandidate').mockResolvedValue(mockCandidate);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockCandidate);

      await service.remove(candidateId, userId);

      expect(service.getCandidate).toHaveBeenCalledWith(candidateId, userId);
      expect(repository.remove).toHaveBeenCalledWith(mockCandidate);
    });
  });
});
