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
import {
  OfferStatus,
  OrderStatus,
} from 'src/infrastructure/data/enums/order-status.enumt';
import { Roles } from 'src/modules/authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { DataSource } from 'typeorm';
import { where } from 'sequelize';
import { OrderReviewDto } from './dto/request/order-reveiw.dto';
import { Chat } from 'src/infrastructure/entities/chat/chat.entity';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(User) private readonly user_repo: Repository<User>,
    @InjectRepository(OrderOffer)
    public readonly orderOffer_repo: Repository<OrderOffer>,
    @InjectRepository(Order) private readonly order_repo: Repository<Order>,
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(PackageType)
    private readonly packageTypeRepo: Repository<PackageType>,
    @InjectRepository(Driver) private readonly driver_repo: Repository<Driver>,
    @Inject(DataSource) private readonly dataSource: DataSource,
    @InjectRepository(Driver) private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
  ) {
    super(order_repo);
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = plainToInstance(Order, dto);
    const now = Date.now(); // current timestamp
    const random = Math.floor(1000 + Math.random() * 9000);
    return this.order_repo.save({
      ...order,
      package_type_id: dto.package_type_id,
      truck_type_id: dto.truck_type_id,
      user_id: this.request.user.id,
      number: `ORD-${now}-${random}`,
    });
  }

  async createOffer(dto: CreateOfferDto): Promise<OrderOffer> {
    const order = await this.order_repo.findOne({
      where: { id: dto.order_id },
    });
    if (!order) throw new Error('Order not found');
    if (order.status != OrderStatus.PENDING)
      throw new Error('Order not pending');

    const offer = plainToInstance(OrderOffer, dto);
    const driver = await this.driver_repo.findOne({
      where: { user_id: this.request.user.id },
    });
    //find existing offer
    const existingOffer = await this.orderOffer_repo.findOne({
      where: {
        order_id: dto.order_id,
        driver_id: driver.id,
        status: OfferStatus.PENDING,
      },
    });

    if (existingOffer) {
      return this.orderOffer_repo.save({
        ...existingOffer,
        price: dto.price,
        is_new: false,
      });
    }
    return this.orderOffer_repo.save({
      ...offer,
      driver_id: driver.id,
    });
  }

  async getDriver() {
    const driver = await this.driver_repo.findOne({
      where: { user_id: this.request.user.id },
    });
    return driver;
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
      .leftJoinAndSelect('order.driver', 'driver')
      .where('order.status = :status', { status: OrderStatus.PENDING })
      // ✅ Only include orders that match the driver’s vehicle type
      .andWhere('order.truck_type_id = :truckTypeId', {
        truckTypeId: driver.vehicle_type_id,
      })
      // ✅ Distance filter
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
          maxDistance: 10, // kilometers
        },
      )
      // ✅ Cooling / Freezing logic
      .andWhere(
        `
      (
        (order.needs_cooling = false AND order.needs_freezing = false)
        OR (order.needs_cooling = true AND :driverCooling = true)
        OR (order.needs_freezing = true AND :driverFreezing = true)
      )
      `,
        {
          driverCooling: driver.vehicle_has_cooling,
          driverFreezing: driver.vehicle_has_freezing,
        },
      )
      .addOrderBy('order.created_at', 'DESC')
      .getMany();

    return offers;
  }

  async findNearbyDrivers(
    driverLat: number,
    driverLng: number,
    maxDistanceKm = 10,
  ) {
    const drivers = await this.driver_repo
      .createQueryBuilder('driver')
      .select(['driver.user_id']) // ✅ only select user_id
      // .where('driver.is_available = true')
      .where(
        `
      (
        6371 * acos(
          cos(radians(:lat)) *
          cos(radians(driver.latitude)) *
          cos(radians(driver.longitude) - radians(:lng)) +
          sin(radians(:lat)) *
          sin(radians(driver.latitude))
        )
      ) <= :radius
      `,
        {
          lat: driverLat,
          lng: driverLng,
          radius: maxDistanceKm,
        },
      )
      .orderBy(
        `
      (
        6371 * acos(
          cos(radians(:lat)) *
          cos(radians(driver.latitude)) *
          cos(radians(driver.longitude) - radians(:lng)) +
          sin(radians(:lat)) *
          sin(radians(driver.latitude))
        )
      )
      `,
        'ASC',
      )
      .getRawMany(); // ✅ raw result gives clean output

    return drivers.map((d) => d.driver_user_id);
  }

  async getOrderDetails(id: string) {
    const order = await this.order_repo.findOne({
      where: { id },
      relations: {
        user: true,
        driver: { user: true, vehicle_type: true },
        truck_type: true,
        package_type: true,
        offers: true,
      },
    });
    if (!order) throw new Error('Order not found');
    if (
      order.status == OrderStatus.PENDING &&
      this.request.user.roles[0] == Role.DRIVER
    ) {
      const sent_offer = await this.orderOffer_repo.findOne({
        where: {
          order_id: id,
          driver: { user_id: this.request.user.id },
          status: OfferStatus.PENDING,
        },
      });
      if (sent_offer) {
        order.sent_offer = true;
      } else {
        order.sent_offer = false;
      }
    }
    order.offers_number = order.offers?.length || 0;
    const order_offer = await this.orderOffer_repo.findOne({
      where: { order_id: id, status: OfferStatus.ACCEPTED },
    });
    const chat = await this.chatRepo.findOne({
      where: {
        client_id: order.user_id,
        driver_id: order.driver_id,
      },
    });

    return {
      ...order,
      offer: order_offer,
    };
  }

  async getClientOffers(id: string) {
    const offers = await this.orderOffer_repo.find({
      where: { order_id: id, status: OfferStatus.PENDING },
      relations: { driver: { user: true } },
      order: { created_at: 'DESC' },
    });
    return offers;
  }

  async acceptOffer(id: string) {
    return await this.dataSource.transaction(async (manager) => {
      const offer = await manager.findOne(this.orderOffer_repo.target, {
        where: { id },
      });
      if (!offer) throw new Error('Offer not found');

      offer.status = OfferStatus.ACCEPTED;

      const order = await manager.findOne(this.order_repo.target, {
        where: { id: offer.order_id },
      });
      if (!order) throw new Error('Order not found');

      order.status = OrderStatus.ACCEPTED;
      order.driver_id = offer.driver_id;

      await manager.save(order);
      return await manager.save(offer);
    });
  }

  async rejectOffer(id: string) {
    return await this.dataSource.transaction(async (manager) => {
      const offer = await manager.findOne(this.orderOffer_repo.target, {
        where: { id },
      });
      if (!offer) throw new Error('Offer not found');
      offer.status = OfferStatus.REJECTED;
      return await manager.save(offer);
    });
  }

async cancelOffer(id: string) {
  return await this.dataSource.transaction(async (manager) => {
    const offer = await manager.findOne(this.orderOffer_repo.target, {
      where: { order_id: id },
    });
    if (!offer) throw new Error('Offer not found');

    // Make a copy of the offer before removing
    const deletedOffer = { ...offer };

    await manager.softRemove(offer);

    // Return the deleted offer data
    return deletedOffer;
  });
}


  async cancelOrder(id: string) {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(this.order_repo.target, {
        where: { id },
      });
      if (!order) throw new Error('Order not found');
      if (order.status != OrderStatus.PENDING)
        throw new Error('Order not pending');
      order.status = OrderStatus.CANCELLED;
      return await manager.save(order);
    });
  }
  async pickupOrder(id: string) {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(this.order_repo.target, {
        where: { id },
      });
      if (!order) throw new Error('Order not found');
      if (order.status != OrderStatus.ACCEPTED)
        throw new Error('Order not accepted');
      order.status = OrderStatus.PICKED_UP;
      return await manager.save(order);
    });
  }

  async deliverOrder(id: string) {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(this.order_repo.target, {
        where: { id },
      });
      if (!order) throw new Error('Order not found');
      if (order.status != OrderStatus.PICKED_UP)
        throw new Error('Order not picked up');
      order.status = OrderStatus.DELIVERED;
      return await manager.save(order);
    });
  }

  async completeOrder(id: string) {
    return await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(this.order_repo.target, {
        where: { id },
      });
      if (!order) throw new Error('Order not found');
      if (order.status != OrderStatus.DELIVERED)
        throw new Error('Order not delivered');
      order.status = OrderStatus.COMPLETED;
      return await manager.save(order);
    });
  }

  async rateOrder(req: OrderReviewDto) {
    const order = await this.order_repo.findOne({
      where: { id: req.order_id },
    });
    if (!order) throw new Error('Order not found');
    if (order.status != OrderStatus.DELIVERED)
      throw new Error('Order not completed');
    if (this.request.user.roles[0] == Role.CLIENT) {
      order.client_rate = req.rate;
      order.client_comment = req.comment;
    } else if (this.request.user.roles[0] == Role.DRIVER) {
      order.driver_rate = req.rate;
      order.driver_comment = req.comment;

      const driver = await this.driverRepo.findOne({
        where: { id: order.driver_id },
      });
      driver.total_rating = driver.total_rating + req.rate;
      driver.number_of_ratings = driver.number_of_ratings + 1;
      await this.driverRepo.save(driver);
    } else {
      throw new Error('Invalid role');
    }
    return this.order_repo.save(order);
  }
}
