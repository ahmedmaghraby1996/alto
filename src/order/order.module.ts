import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { NotificationService } from 'src/modules/notification/services/notification.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService,OrderGateway,NotificationService],
  exports: [OrderModule]
})
export class OrderModule {}
