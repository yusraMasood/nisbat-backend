import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createMessage(
    senderId: string,
    receiverId: string,
    content: string,
  ): Promise<Message> {
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });
    const receiver = await this.userRepository.findOne({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new Error('Sender or receiver not found');
    }

    const message = this.messageRepository.create({
      sender,
      receiver,
      content,
    });

    return this.messageRepository.save(message);
  }

  async getMessagesBetweenUsers(
    userId1: string,
    userId2: string,
  ): Promise<Message[]> {
    return this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.senderId = :userId1 AND message.receiverId = :userId2) OR (message.senderId = :userId2 AND message.receiverId = :userId1)',
        { userId1, userId2 },
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
