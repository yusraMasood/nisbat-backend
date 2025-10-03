import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { CandidateStatus, Gender, MaritalStatus } from './create-candidate.dto';
//import { Gender, MaritalStatus, CandidateStatus } from './candidate.dto';
//import { User } from '../users/user.entity';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  fullName: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'enum', enum: Gender, nullable: false })
  gender: Gender;

  @Column({ type: 'date', nullable: false })
  dob: Date;

  @Column({ type: 'enum', enum: MaritalStatus, nullable: false })
  maritalStatus: MaritalStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  height?: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  religion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  caste?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  language?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  education?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  job?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  income?: string;

  // Preferences
  @Column({ type: 'varchar', length: 20, nullable: true })
  preferredAge?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  preferredHeight?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  preferredEducation?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preferredCaste?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  preferredLanguage?: string;

  @Column({ type: 'text', nullable: true })
  otherPreferred?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  preferredLocation?: string;

  @Column({
    type: 'enum',
    enum: CandidateStatus,
    default: CandidateStatus.PENDING,
  })
  status: CandidateStatus;

  // Relation: who created this candidate profile (family/matchmaker/user)
  //@Column()
  //userId: string;

  //@ManyToOne(() => User, (user) => user.candidates, { nullable: false })
  //user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
