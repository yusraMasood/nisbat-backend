import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role, UserRole } from './role.enum';
import { Candidate } from 'src/candidates/candidate.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  @OneToMany(() => Candidate, (candidate) => candidate.user)
  @Expose()
  candidates: Candidate[];

  @Column('text', { array: true, default: [Role.USER] })
  @Expose()
  roles: Role[];

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  @Expose()
  userRole: UserRole;
}
