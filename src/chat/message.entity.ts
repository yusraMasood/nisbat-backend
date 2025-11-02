import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user: User) => user.sentMessages, { eager: true })
  sender: User;

  @ManyToOne(() => User, (user: User) => user.receivedMessages, { eager: true })
  receiver: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
