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
import { OrderListResponse } from './dto/response/order-list.response';
import { OrderDetailsResponse } from './dto/response/order.detials.response';
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

  @Get()
  async getAll(@Query() query: PaginatedRequest) {
    const orders = await this.orderService.findAll(query);
    const total = await this.orderService.count(query);

    return new PaginatedResponse(orders, { meta: { total, ...query } });
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
    const response= this._i18nResponse.entity(order);
    const result = plainToInstance(OrderDetailsResponse, response, {
      excludeExtraneousValues: true,
    });
    return new ActionResponse(result);
  }

  @Roles(Role.DRIVER)
  @Post('create-offer')
  async createOffer(@Body() req: CreateOfferDto) {
    return new ActionResponse(await this.orderService.createOffer(req));
  }

  // @Get()
  // async getAll() {}
}
