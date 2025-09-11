import { Expose, Type } from 'class-transformer';
import { OrderListResponse } from './order-list.response';
import { PackageType } from 'src/infrastructure/entities/order/package-type.entity';

export class OrderDetailsResponse extends OrderListResponse {
  @Expose()
  pickup_latitude: number;
  @Expose()
  pickup_longitude: number;
  @Expose()
  delivery_latitude: number;
  @Expose()
  delivery_longitude: number;
  @Expose()
  @Type(() => PackageType)
  package_type: PackageType;
  @Expose()
  package_price: number;
  @Expose()
  package_weight: string;

  @Expose()
  sent_offer:boolean

  


}
