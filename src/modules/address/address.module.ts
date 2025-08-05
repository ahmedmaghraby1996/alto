import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { Module } from '@nestjs/common';
import { SetFavoriteAddressTransaction } from './utils/transactions/set-favorite-address.transaction';

import { TransactionModule } from '../transaction/transaction.module';

@Module({
  controllers: [AddressController],
  providers: [
    AddressService,

    SetFavoriteAddressTransaction,

  ],
  imports: [ TransactionModule],
  exports: [AddressModule],
})
export class AddressModule {}
