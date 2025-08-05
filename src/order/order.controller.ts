import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { CreateOrderDto } from './dto/request/create-order.dto';
import { ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { Router } from 'express';
import { JwtAuthGuard } from 'src/modules/authentication/guards/jwt-auth.guard';
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
  constructor(private readonly orderService: OrderService) {}
  @Post('create')
  async create(@Body() req: CreateOrderDto) {
    return new ActionResponse(await this.orderService.create(req));
  }

  // @Get()
  // async getAll() {}
}
