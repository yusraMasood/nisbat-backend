import { Injectable, NotFoundException } from '@nestjs/common';
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
  public async getCandidates(): Promise<Candidate[]> {
    return await this.candidateRepository.find();
  }
  public async create(createTaskDto: CreateCandidateDto): Promise<Candidate> {
    return await this.candidateRepository.save(createTaskDto);
  }
  async getCandidate(id: string): Promise<Candidate> {
    console.log('id', id);
    const candidate = await this.candidateRepository.findOne({ where: { id } });
    console.log('candidate', candidate);

    if (!candidate) throw new NotFoundException(`Candidate ${id} not found`);
    return candidate;
  }

  async update(
    id: string,
    dto: Partial<CreateCandidateDto>,
  ): Promise<Candidate> {
    const candidate = await this.getCandidate(id);
    Object.assign(candidate, dto);
    return this.candidateRepository.save(candidate);
  }
  async remove(id: string): Promise<void> {
    const candidate = await this.getCandidate(id);
    await this.candidateRepository.remove(candidate);
  }
}
