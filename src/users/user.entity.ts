import { Expose } from 'class-transformer';
import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.enum';
import { Candidate } from '../candidates/candidate.entity';
import { Friend } from '../friends/friend.entity';
import { Message } from '../chat/message.entity';

export type SuggestionStatus = 'none' | 'pending' | 'requested';

@Entity('users')
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
	@Expose()
	phoneNumber: string;

	@Column({ nullable: true })
	@Expose()
	fullName?: string;

	@Column({ nullable: true })
	@Expose()
	phone?: string;

	@Column({ type: 'text', nullable: true })
	@Expose()
	profileImage?: string | null;

	@Column({ nullable: true })
	@Expose()
	religion?: string;

	@Column({ nullable: true })
	@Expose()
	subReligion?: string;

	@Column({ nullable: true })
	@Expose()
	languages?: string;

	@Column({ nullable: true })
	@Expose()
	caste?: string;

	@Column({ nullable: true })
	@Expose()
	gender?: string;

	@Column({ nullable: true })
	@Expose()
	city?: string;

	@Column({ nullable: true })
	@Expose()
	country?: string;

	@Column({ nullable: true })
	@Expose()
	contactMethod?: string;

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

	@Expose({ groups: ['suggestions'] })
	status?: SuggestionStatus;
}
