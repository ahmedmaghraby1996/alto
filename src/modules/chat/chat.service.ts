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
  async startChat(order_id: string): Promise<Chat> {
    const clientId = this.request.user.id;
    const order=await this.orderRepo.findOne({where:{id:order_id}})
    if(!order){
      throw new NotFoundException('Order not found');
    }
    if(order.driver_id==null){
      throw new NotFoundException('Order has no driver yet');
    }

    const existing = await this.chatRepo.findOne({
      where: { client: { id: clientId }, driver: { id: order.driver_id } },
    });

    if (existing) return existing;

 const newChat = this.chatRepo.create({
  client: { id: clientId },
  driver: { id: order.driver_id },
});
    await this.orderRepo.update({id:order_id},{chat_id:newChat.id})
    return await this.chatRepo.save(newChat);

  }

  async sendMessage(order_id: string, content: string): Promise<Message> {
 const start_chat=   await this.startChat(order_id);


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
    await this.chatRepo.update({id:start_chat.id},{last_message_id:message.id})
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
    order: { created_at: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return { items, total };
}


  // chat.service.ts (continued)
async getUserChats(
  page = 1,
  limit = 20,
): Promise<{ items: Chat[]; total: number }> {
  const roles = this.request.user.roles;
  const userId = this.request.user.id;

  const roleColumn = roles.includes(Role.CLIENT)
    ? 'client_id'
    : 'driver_id';

  const [chats, total] = await this.chatRepo.findAndCount({
    where: { [roleColumn]: userId },
    relations: {client: true, driver: true, last_message: true},// load relations you need
    order: { created_at: "DESC" }, // sort by last_message
    skip: (page - 1) * limit,
    take: limit,
  });

  return { items: chats, total };
}



}
