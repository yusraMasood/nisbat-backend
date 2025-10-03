import { Body, Controller, Get, Post } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './create-candidate.dto';
import { Candidate } from './candidate.entity';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get()
  getCandidates(): Promise<Candidate[]> {
    return this.candidatesService.getCandidates();
  }
  @Post()
  public async create(
    @Body() createCandidate: CreateCandidateDto,
    //@CurrentUserId() userId: string,
  ): Promise<Candidate> {
    return await this.candidatesService.create({
      ...createCandidate,
      //userId,
    });
  }
}
