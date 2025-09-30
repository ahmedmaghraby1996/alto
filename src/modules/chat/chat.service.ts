// chat.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Chat } from 'src/infrastructure/entities/chat/chat.entity';
import { Message } from 'src/infrastructure/entities/chat/messages.entity';

import { User } from 'src/infrastructure/entities/user/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { ChatGateway } from 'src/integration/gateways/chat.gateway';
import { plainToInstance } from 'class-transformer';
import { MessageRespone } from './dto/message.response';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { BaseService } from 'src/core/base/service/service.base';


@Injectable()
export class ChatService extends BaseService<Chat> {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private readonly chatGateway: ChatGateway,
  ) {
    super( chatRepo);
  }
// 
  async startChat(driver_id: string): Promise<Chat> {
    const clientId = this.request.user.id;
    const driver=await this.userRepo.findOne({ where: { id: driver_id,  } });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    const existing = await this.chatRepo.findOne({
      where: { client: { id: clientId }, driver: { id: driver_id } },
    });

    if (existing) return existing;

    const newChat = new Chat({
      client_id: clientId,
      driver_id: driver_id,
    });
    return await this.chatRepo.save(newChat);
  }

  async sendMessage(driver_id: string, content: string): Promise<Message> {
 const start_chat=   await this.startChat(driver_id);


    const senderId = this.request.user.id;
    const message = this.msgRepo.create({
      chat_id: start_chat.id,
      sender_id: senderId,
      content,
    });

    await this.msgRepo.save(message);
    const chat = await this.chatRepo.findOne({
      where: { id: start_chat.id },
      relations: {},
    });
        this.chatGateway.server.emit(
      'new-message-' + start_chat.id ,
      plainToInstance(MessageRespone, {...message, sender: this.request.user}, {
        excludeExtraneousValues: true,
      }),
    );
    return message;
  }

async getMessages(
  chatId: string,
  page = 1,
  limit = 20,
): Promise<{ items: Message[]; total: number }> {
  // Mark unseen messages as seen
  await this.msgRepo.update(
    { chat_id: chatId, is_seen: false },
    { is_seen: true },
  );

  // Fetch messages with pagination
  const [items, total] = await this.msgRepo.findAndCount({
    where: { chat: { id: chatId } },
    relations: ['sender'],
    order: { created_at: 'ASC' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return { items, total };
}


  // chat.service.ts (continued)
async getUserChats(
  page = 1,
  limit = 20,
): Promise<{ items: any[]; total: number }> {
  const roles = this.request.user.roles;
  const userId = this.request.user.id;

  const roleColumn = roles.includes(Role.CLIENT)
    ? 'chat.client_id'
    : 'chat.driver_id';

  // Subquery: Get latest message per chat
  const subQuery = this.chatRepo
    .createQueryBuilder('chat')
    .leftJoin('chat.messages', 'm')
    .select('m.chat_id', 'chat_id')
    .addSelect('MAX(m.created_at)', 'last_created_at')
    .groupBy('m.chat_id');

  // Base query
  const qb = this.chatRepo
    .createQueryBuilder('chat')
    .leftJoinAndSelect('chat.client', 'client')
    .leftJoinAndSelect('chat.messages', 'message')
    .leftJoinAndSelect('chat.driver', 'driver')
    .leftJoin(
      `(${subQuery.getQuery()})`,
      'latest',
      'latest.chat_id = chat.id AND message.created_at = latest.last_created_at',
    )
    .where(`${roleColumn} = :userId`, { userId })
    .orderBy('latest.last_created_at', 'DESC')
    .setParameters(subQuery.getParameters());

  // Pagination
  const [chats, total] = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount();

  // Simplify the last message
  const items = chats.map((chat) => {
    const lastMessage = chat.messages?.[0] ?? null;
    return {
      ...chat,
      last_message: lastMessage,
    };
  });

  return { items, total };
}


}
