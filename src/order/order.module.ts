import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderGateway } from 'src/integration/gateways/order.gateway';

@Module({
  controllers: [OrderController],
  providers: [OrderService,OrderGateway]
})
export class OrderModule {}
