import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';

import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/request/create-order.dto';
import { Request } from 'express';
import{REQUEST} from '@nestjs/core'

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly order_repo: Repository<Order>,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = plainToInstance(Order, dto);
    return this.order_repo.save({
      ...order,
      user_id: this.request.user.id,
    });
  }
}
