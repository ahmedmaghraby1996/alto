import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { OfferStatus } from 'src/infrastructure/data/enums/order-status.enumt';
@Entity('order_offers')
export class OrderOffer extends AuditableEntity {
  @Column({ precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: OfferStatus.PENDING, type: 'enum', enum: OfferStatus })
  status: OfferStatus;

  @ManyToOne(() => Order, (order) => order.offers)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ nullable: true })
  order_id: string;
  @Column({ nullable: true })
  driver_id: string;
}
