import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CandidateStatus, Gender, MaritalStatus } from './create-candidate.dto';
import { User } from 'src/users/user.entity';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  @Expose()
  fullName: string;

  @Column({ type: 'text', nullable: true })
  @Expose()
  image?: string;

  @Column({ type: 'enum', enum: Gender, nullable: false })
  @Expose()
  gender: Gender;

  @Column({ type: 'date', nullable: false })
  @Expose()
  dob: Date;

  @Column({ type: 'enum', enum: MaritalStatus, nullable: false })
  @Expose()
  maritalStatus: MaritalStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Expose()
  height?: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  @Expose()
  religion: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Expose()
  caste?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Expose()
  language?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Expose()
  education?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Expose()
  job?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Expose()
  income?: string;

  // Preferences
  @Column({ type: 'varchar', length: 20, nullable: true })
  @Expose()
  preferredAge?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Expose()
  preferredHeight?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Expose()
  preferredEducation?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Expose()
  preferredCaste?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Expose()
  preferredLanguage?: string;

  @Column({ type: 'text', nullable: true })
  @Expose()
  otherPreferred?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Expose()
  preferredLocation?: string;

  @Column({
    type: 'enum',
    enum: CandidateStatus,
    default: CandidateStatus.PENDING,
  })
  @Expose()
  status: CandidateStatus;

  @Column()
  @Expose()
  userId: string;

  @ManyToOne(() => User, (user) => user.candidates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;
}
