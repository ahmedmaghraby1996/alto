import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { UserController } from './user.controller';
import { OrderGateway } from 'src/integration/gateways/order.gateway';
import { OrderModule } from 'src/order/order.module';

@Global()
@Module({
    imports: [OrderModule],
    controllers: [UserController],
    providers: [UserService,OrderGateway],
    exports: [UserService]
})
export class UserModule { }
