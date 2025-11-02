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
import { Candidate } from '../candidates/candidate.entity';
import { Friend } from '../friends/friend.entity';
import { Message } from '../chat/message.entity';

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

  @OneToMany(() => Friend, (friend) => friend.sender)
  @Expose()
  sentFriendRequests: Friend[];

  @OneToMany(() => Friend, (friend) => friend.receiver)
  @Expose()
  receivedFriendRequests: Friend[];

  @OneToMany(() => Message, (message: Message) => message.sender)
  @Expose()
  sentMessages: Message[];

  @OneToMany(() => Message, (message: Message) => message.receiver)
  @Expose()
  receivedMessages: Message[];

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
