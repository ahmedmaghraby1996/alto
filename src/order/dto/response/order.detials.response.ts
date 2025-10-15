import { Expose, Type } from 'class-transformer';
import { OrderListResponse } from './order-list.response';
import { PackageType } from 'src/infrastructure/entities/order/package-type.entity';
import { OrderOfferResponse } from './order-offer.response';
import { UserResponse } from 'src/modules/user/dto/response/user-response';

export class OrderDetailsResponse extends OrderListResponse {

  @Expose()
  @Type(() => PackageType)
  package_type: PackageType;
  @Expose()
  package_price: number;
  @Expose()
  package_weight: string;

  @Expose()
  sent_offer:boolean
  @Expose()
  offers_number:number

  @Expose()
  @Type(() => OrderOfferResponse)
  offer:OrderOfferResponse

  @Expose()
  driver_rate: number
  @Expose()
  driver_comment: string
  @Expose()
  client_rate: number
  @Expose()
  client_comment: string

  @Expose()
  recipient_name: string
  @Expose()
  recipient_phone: string
  


  


}
