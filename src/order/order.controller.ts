import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { CreateOrderDto } from './dto/request/create-order.dto';
import { ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { Router } from 'express';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { CreateOfferDto } from './dto/request/create-offer.dto';
import { Roles } from 'src/modules/authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { toUrl } from 'src/core/helpers/file.helper';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { OrderListResponse } from './dto/response/order-list.response';
import { OrderDetailsResponse } from './dto/response/order.detials.response';
import {
  applyQueryFilters,
  applyQueryIncludes,
  applyQuerySort,
} from 'src/core/helpers/service-related.helper';
import { OrderOfferResponse } from './dto/response/order-offer.response';
import { OrderReview } from 'src/infrastructure/entities/order/order-review.entity';
import { OrderReviewDto } from './dto/request/order-reveiw.dto';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
@ApiTags('Order')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    @Inject(REQUEST) private readonly request: Request,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    private readonly orderGateway: OrderGateway,
  ) {}

  @Get('get-package-types')
  async getPackageTypes() {
    const types = await this.orderService.getPackageTypes();

    const res = this._i18nResponse.entity(types);
    return new ActionResponse(res);
  }

  @Post('create')
  async create(@Body() req: CreateOrderDto) {
    const createdOrder = await this.orderService.createOrder(req);

    // ✅ Run async but don't block response
    (async () => {
      try {
        const detailedOrder = await this.getOrder(createdOrder.id);
        const driverUserIds = await this.orderService.findNearbyDrivers(
          createdOrder.pickup_latitude,
          createdOrder.pickup_longitude,
        );

        driverUserIds.forEach((userId) => {
          this.orderGateway.server.emit(`new-order-${userId}`, detailedOrder);
        });
      } catch (err) {
        console.error('Error sending notifications:', err);
      }
    })();

    // ✅ Respond instantly 🚀
    return new ActionResponse(createdOrder);
  }

  @Roles(Role.CLIENT, Role.DRIVER)
  @Get()
  async getAll(@Query() query: PaginatedRequest) {
    applyQueryIncludes(query, 'user');
    applyQueryIncludes(query, 'driver');
    applyQueryIncludes(query, 'driver#user.vehicle_type');
    applyQueryIncludes(query, 'offers');
    applyQuerySort(query, `created_at=desc`);
    if (this.request.user.roles.includes(Role.DRIVER)) {
      const driver = await this.orderService.getDriver();
      console.log(driver);
      applyQueryFilters(query, `driver_id=${driver.id}`);
    }

    if (this.request.user.roles.includes(Role.CLIENT)) {
      applyQueryFilters(query, `user_id=${this.request.user.id}`);
    }

    const orders = await this.orderService.findAll(query);
    const total = await this.orderService.count(query);
    const response = plainToInstance(OrderListResponse, orders, {
      excludeExtraneousValues: true,
    });
    const result = this._i18nResponse.entity(response);

    return new PaginatedResponse(result, { meta: { total, ...query } });
  }
  @Roles(Role.CLIENT)
  @Get('get-client-offers/:id')
  async getClientOffers(@Param('id') id: string) {
    const offers = await this.orderService.getClientOffers(id);
    const result = plainToInstance(OrderOfferResponse, offers, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(result);
  }

  @Roles(Role.CLIENT)
  @Post('accept-offer/:id')
  async acceptOffer(@Param('id') id: string) {
    return new ActionResponse(await this.orderService.acceptOffer(id));
  }

  @Roles(Role.CLIENT)
  @Post('reject-offer/:id')
  async rejectOffer(@Param('id') id: string) {
    return new ActionResponse(await this.orderService.rejectOffer(id));
  }
  // cancel order
  @Roles(Role.CLIENT)
  @Post('cancel/:id')
  async cancelOrder(@Param('id') id: string) {
    const cancelOrder = await this.orderService.cancelOrder(id);
    try {
      const detailedOrder = await this.getOrder(cancelOrder.id);
      this.orderGateway.server.emit(
        'order-update-status-' + cancelOrder.driver_id,
        detailedOrder,
      );
    } catch (err) {}
    return new ActionResponse(cancelOrder);
  }

  @Roles(Role.DRIVER)
  @Post('cancel-offer/:id')
  async cancel(@Param('id') id: string) {
    const cancelOffer = await this.orderService.cancelOffer(id);
    try {
      const offer = await this.getOfferDetails(cancelOffer.id);
      this.orderGateway.server.emit(
        'cancel-offer-' + cancelOffer.order_id,
        offer,
      );
    }catch (err) {}
    return new ActionResponse(cancelOffer);
  }

  @Roles(Role.DRIVER)
  @Post('pickup/:id')
  async pickupOrder(@Param('id') id: string) {
    const pickedOrder = await this.orderService.pickupOrder(id);
    try {
      const detailedOrder = await this.getOrder(pickedOrder.id);
      this.orderGateway.server.emit(
        'order-update-status-' + pickedOrder.user_id,
        detailedOrder,
      );
    } catch (err) {}
    return new ActionResponse(pickedOrder);
  }

  @Roles(Role.DRIVER)
  @Post('deliver/:id')
  async deliverOrder(@Param('id') id: string) {
    const deliveredOrder = await this.orderService.deliverOrder(id);
    try {
      const detailedOrder = await this.getOrder(deliveredOrder.id);
      this.orderGateway.server.emit(
        'order-update-status-' + deliveredOrder.user_id,
        detailedOrder,
      );
    } catch (err) {}
    return new ActionResponse(deliveredOrder);
  }

  @Roles(Role.CLIENT)
  @Post('complete/:id')
  async completeOrder(@Param('id') id: string) {
    return new ActionResponse(await this.orderService.completeOrder(id));
  }

  @Roles(Role.DRIVER)
  @Get('get-driver-offers')
  async getDriverOffers() {
    const offers = await this.orderService.getDriverOffers();
    const result = plainToInstance(OrderListResponse, offers, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(result);
  }

  @Get('get-order/:id')
  async getOrder(@Param('id') id: string) {
    const order = await this.orderService.getOrderDetails(id);

    const result = plainToInstance(OrderDetailsResponse, order, {
      excludeExtraneousValues: true,
    });
    const response = this._i18nResponse.entity(result);
    return new ActionResponse(response);
  }

  @Roles(Role.DRIVER)
  @Post('create-offer')
  async createOffer(@Body() req: CreateOfferDto) {
    const offer = await this.orderService.createOffer(req);
    try {
      const offerDetails = await this.getOfferDetails(offer.id);
      this.orderGateway.server.emit(
        'new-offer-' + offer.order_id,
        offerDetails,
      );
    } catch (err) {}
    return new ActionResponse(offer);
  }

  @Roles(Role.CLIENT, Role.DRIVER)
  @Post('rate')
  async rateOrder(@Body() req: OrderReviewDto) {
    return new ActionResponse(await this.orderService.rateOrder(req));
  }

  async getOfferDetails(@Param('id') id: string) {
    const offer = await this.orderService.orderOffer_repo.findOne({
      where: { id },
      relations: { driver: { user: true } },
    });
    const result = plainToInstance(OrderOfferResponse, offer, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(result);
  }

  // @Get()
  // async getAll() {}
}
