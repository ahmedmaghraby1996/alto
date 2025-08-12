import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';

import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/request/create-order.dto';
import { Request } from 'express';
import{REQUEST} from '@nestjs/core'
import { BaseService } from 'src/core/base/service/service.base';
import { OrderOffer } from 'src/infrastructure/entities/order/order-offer.entity';
import { CreateOfferDto } from './dto/request/create-offer.dto';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { PackageType } from 'src/infrastructure/entities/order/package-type.entity';

@Injectable()
export class OrderService  extends BaseService<Order> {
  constructor(
    @InjectRepository(User) private readonly user_repo: Repository<User>,
    @InjectRepository(OrderOffer) private readonly orderOffer_repo: Repository<OrderOffer>,
    @InjectRepository(Order) private readonly order_repo: Repository<Order>,
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(PackageType) private readonly packageTypeRepo: Repository<PackageType>,
  ) {
    super(order_repo);
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = plainToInstance(Order, dto);
    return this.order_repo.save({
      ...order,
      user_id: this.request.user.id,
    });
  }

  async createOffer(dto: CreateOfferDto): Promise<OrderOffer> {
    const offer = plainToInstance(OrderOffer, dto);
    const driver = await this.user_repo.findOne({ where: { id: this.request.user.id } });
    return this.orderOffer_repo.save({
      ...offer,
      driver_id:  driver.id,
    });
  }

  async getPackageTypes(): Promise<PackageType[]> {
    const types = await this.packageTypeRepo.find();
    return types
  }
}
