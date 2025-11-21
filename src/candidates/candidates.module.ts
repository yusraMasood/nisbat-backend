import { Module } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { Friend } from '../friends/friend.entity';
import { usersModule } from '../users/users.module';
import { FileUploadService } from '../common/file-upload/file-upload.service';

@Module({
	imports: [TypeOrmModule.forFeature([Candidate, Friend]), usersModule],
	controllers: [CandidatesController],
	providers: [CandidatesService, FileUploadService],
})
export class CandidatesModule { }
