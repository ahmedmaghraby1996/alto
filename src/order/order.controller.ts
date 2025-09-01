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
import { applyQueryFilters } from 'src/core/helpers/service-related.helper';
import { OrderOfferResponse } from './dto/response/order-offer.response';
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
  ) {}

  @Get('get-package-types')
  async getPackageTypes() {
    const types = await this.orderService.getPackageTypes();

    const res = this._i18nResponse.entity(types);
    return new ActionResponse(res);
  }

  @Post('create')
  async create(@Body() req: CreateOrderDto) {
    return new ActionResponse(await this.orderService.createOrder(req));
  }

  @Roles(Role.CLIENT)
  @Get()
  async getAll(@Query() query: PaginatedRequest) {
    applyQueryFilters(query, `user_id=${this.request.user.id}`);
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
    return new ActionResponse(await this.orderService.createOffer(req));
  }

  // @Get()
  // async getAll() {}
}
