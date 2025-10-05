import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCandidateDto } from './create-candidate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
  ) {}
  public async getCandidates(userId: string): Promise<Candidate[]> {
    return await this.candidateRepository.find({ where: { userId } });
  }
  public async create(createTaskDto: CreateCandidateDto): Promise<Candidate> {
    return await this.candidateRepository.save(createTaskDto);
  }
  async getCandidate(id: string, userId: string): Promise<Candidate> {
    const candidate = await this.candidateRepository.findOne({ where: { id } });
    if (!candidate) throw new NotFoundException(`Candidate ${id} not found`);
    if (candidate.userId !== userId) {
      throw new ForbiddenException('You are not allowed to do this action');
    }
    return candidate;
  }

  async update(
    id: string,
    dto: Partial<CreateCandidateDto>,
    userId: string,
  ): Promise<Candidate> {
    const candidate = await this.getCandidate(id, userId);
    console.log(candidate.userId, userId);
    Object.assign(candidate, dto);
    return this.candidateRepository.save(candidate);
  }
  async remove(id: string, userId: string): Promise<void> {
    const candidate = await this.getCandidate(id, userId);
    await this.candidateRepository.remove(candidate);
  }
}
