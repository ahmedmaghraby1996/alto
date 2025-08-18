import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TruckType } from '../truck/truck-type.entity';
import { PackageType } from './package-type.entity';
import { Address } from '../user/address.entity';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enumt';
import { User } from '../user/user.entity';
import { OrderOffer } from './order-offer.entity';
@Entity('order')
export class Order extends AuditableEntity {
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => TruckType)
  @JoinColumn()
  truck_type: TruckType;

  @Column({ nullable: true })
  truck_type_id: string;

  @Column()
  trucks_count: number;
  @OneToMany(() => OrderOffer, (orderOffer) => orderOffer.order)
  offers: OrderOffer[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  package_price: number;

  @ManyToOne(() => PackageType)
  @JoinColumn({ name: 'package_type' })
  packageType: PackageType;
  @Column({ nullable: true })
  package_type_id: string;

  @Column()
  package_weight: string;

  @Column({ default: OrderStatus.PENDING, type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  pickup_address: string;
  @Column({ type: 'float', precision: 11, scale: 6 })
  pickup_latitude: number;
  @Column({ type: 'float', precision: 11, scale: 6 })
  pickup_longitude: number;
  @Column({ nullable: true })
  delivery_address: string;
  @Column({ type: 'float', precision: 11, scale: 6 })
  delivery_latitude: number;

  @Column({ type: 'float', precision: 11, scale: 6 })
  delivery_longitude: number;

  @Column({ default: false })
  is_fragile: boolean;

  @Column({ default: false })
  needs_cooling: boolean;
  @Column({ default: false })
  needs_freezing: boolean;

  @Column({ nullable: true })
  recipient_name: string;

  @Column({ nullable: true })
  recipient_phone: string;
}
