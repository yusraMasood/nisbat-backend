import { Module } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { Friend } from '../friends/friend.entity';
import { usersModule } from '../users/users.module';

@Module({
	imports: [TypeOrmModule.forFeature([Candidate, Friend]), usersModule],
	controllers: [CandidatesController],
	providers: [CandidatesService],
})
export class CandidatesModule { }
