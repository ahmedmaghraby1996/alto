import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { OfferStatus } from 'src/infrastructure/data/enums/order-status.enumt';
import { Driver } from '../driver/driver.entity';
@Entity('order_offers')
export class OrderOffer extends AuditableEntity {
@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
price: number;

  @Column({ default: OfferStatus.PENDING, type: 'enum', enum: OfferStatus })
  status: OfferStatus;

  @ManyToOne(() => Order, (order) => order.offers)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ nullable: true })
  order_id: string;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;
  @Column({ default: true })
  is_new: boolean;
  @Column({ nullable: true })
  driver_id: string;
}
