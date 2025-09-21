import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

export class OrderReview extends AuditableEntity {
  @ManyToOne(() => Order)
  order: Order;
  @Column({ nullable: true })
  order_id: string;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  driver_rate: number;
  @Column({ nullable: true })
  driver_comment: string;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  client_rate: number;
  @Column({ nullable: true })
  client_comment: string;
}
