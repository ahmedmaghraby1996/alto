import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';

import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/request/create-order.dto';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { BaseService } from 'src/core/base/service/service.base';
import { OrderOffer } from 'src/infrastructure/entities/order/order-offer.entity';
import { CreateOfferDto } from './dto/request/create-offer.dto';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { PackageType } from 'src/infrastructure/entities/order/package-type.entity';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enumt';
import { Roles } from 'src/modules/authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(User) private readonly user_repo: Repository<User>,
    @InjectRepository(OrderOffer)
    private readonly orderOffer_repo: Repository<OrderOffer>,
    @InjectRepository(Order) private readonly order_repo: Repository<Order>,
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(PackageType)
    private readonly packageTypeRepo: Repository<PackageType>,
    @InjectRepository(Driver) private readonly driver_repo: Repository<Driver>,
  ) {
    super(order_repo);
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = plainToInstance(Order, dto);
    return this.order_repo.save({
      ...order,
      package_type_id: dto.package_type_id,
      truck_type_id: dto.truck_type_id,
      user_id: this.request.user.id,
    });
  }

  async createOffer(dto: CreateOfferDto): Promise<OrderOffer> {
    const offer = plainToInstance(OrderOffer, dto);
    const driver = await this.user_repo.findOne({
      where: { id: this.request.user.id },
    });
    return this.orderOffer_repo.save({
      ...offer,
      driver_id: driver.id,
    });
  }

  async getPackageTypes(): Promise<PackageType[]> {
    const types = await this.packageTypeRepo.find();
    return types;
  }

  async getDriverOffers() {
    const driver = await this.driver_repo.findOne({
      where: { user_id: this.request.user.id },
    });
    if (!driver) throw new Error('Driver not found');

    const offers = await this.order_repo
      .createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.PENDING })
      .andWhere(
        `
    (
      6371 * acos(
        cos(radians(:driverLat)) *
        cos(radians(order.pickup_latitude)) *
        cos(radians(order.pickup_longitude) - radians(:driverLng)) +
        sin(radians(:driverLat)) *
        sin(radians(order.pickup_latitude))
      )
    ) <= :maxDistance
  `,
        {
          driverLat: driver.latitude,
          driverLng: driver.longitude,
          maxDistance: 10, // in kilometers
        },
      )
      .getMany();

    return offers;
  }

  async getOrderDetails(id: string) {
    const order = await this.order_repo.findOne({
      where: { id },
      relations: {
        user: true,
        driver: true,
        truck_type: true,
        package_type: true,
      },
    });
    if (!order) throw new Error('Order not found');
    if (
      order.status == OrderStatus.PENDING &&
      this.request.user.roles[0] == Role.DRIVER
    ) {
      const sent_offer = await this.orderOffer_repo.findOne({
        where: { order_id: id, driver_id: this.request.user.id },
      });
      if (sent_offer) {
        order.sent_offer = true;
      } else {
        order.sent_offer = false;
      }
    }
    return order;
  }
}
