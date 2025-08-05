import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TruckType } from '../truck/truck-type.entity';
import { PackageType } from './package-type.entity';
import { Address } from '../user/address.entity';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enumt';
import { User } from '../user/user.entity';
@Entity('order')
export class Order extends AuditableEntity {

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => TruckType)
  @JoinColumn({ name: 'type_id' })
  truck_type: TruckType;

  @Column({ nullable: true })
  truck_type_id: string;  

  @Column()
  trucks_count: number;

  @Column()
  package_price: number;

  @ManyToOne(() => PackageType)
  @JoinColumn({ name: 'package_type' })
  packageType: PackageType;
  @Column({ nullable: true })
  package_type: string;

  @Column()
  package_weight: string;

  @Column({default:OrderStatus.PENDING,type:"enum",enum:OrderStatus})
  status: OrderStatus;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Address)
  @JoinColumn({ name: 'pickup_address_id' })
  pickup_address: Address;
  @Column({ nullable: true })
  pickup_address_id: string;
  @ManyToOne(() => Address)
  @JoinColumn({ name: 'delivery_address_id' })
  delivery_address: Address;
  @Column({ nullable: true })
  delivery_address_id: string;

  @Column({ default: false })
  is_fragile: boolean;

  @Column({ default: false })
  needs_cooling: boolean;
  @Column({ default: false })
  needs_freezing: boolean;


  @Column({nullable:true})
 recipient_name:string

  @Column({nullable:true})
  recipient_phone:string
}
