import { Injectable } from '@nestjs/common';
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
  private candidates = [
    {
      id: 1,
      fullName: '',
      image: '',
      gender: '',
      dob: '',
      martialStatus: '',
      height: '',
      religion: '',
      caste: '',
      language: '',
      education: '',
      job: '',
      income: '',
      preferredAge: '',
      preferredHeight: '',
      preferredEducation: '',
      preferredCaste: '',
      preferredLanguage: '',
      otherPreferred: '',
      preferredLocation: '',
      status: 'PENDING',
      createdAt: '',
      updatedAt: '',
    },
  ];
  getCandidates(): Promise<Candidate[]> {
    return this.candidateRepository.find();
  }
  public async create(createTaskDto: CreateCandidateDto): Promise<Candidate> {
    //if (createTaskDto.labels) {
    //  createTaskDto.labels = this.getUniqueLabels(createTaskDto.labels);
    //}
    return await this.candidateRepository.save(createTaskDto);
  }
}
