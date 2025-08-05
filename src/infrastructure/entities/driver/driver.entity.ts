import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { User } from '../user/user.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { City } from '../city/city.entity';
import { DriverStatus } from 'src/infrastructure/data/enums/driver-status.enum';
import { TruckType } from '../truck/truck-type.entity';
import { IDType } from 'src/infrastructure/data/enums/id-type.enum';
@Entity()
export class Driver extends AuditableEntity {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => TruckType)
  vehicle_type: TruckType;

  @Column({ nullable: true })
  vehicle_type_id: string;

  @Column({ nullable: true })
  vehicle_registration_number: string;

  @Column({ nullable: true })
  driving_license_number: string;

  @Column({ nullable: true })
  driving_license_image: string;

  @Column({ nullable: true })
  id_number: string;

  @Column({ enum: IDType,default:IDType.NATIONAL_ID })
  id_type: IDType;

  @Column({
    type: 'enum',
    default: DriverStatus.PENDING,
    enum: DriverStatus,
  })
  status: DriverStatus;

  @Column({ nullable: true })
  vehicle_registration_image: string;

  @ManyToMany(() => City)
  cities: City[];
  constructor(partial?: Partial<Driver>) {
    super();
    Object.assign(this, partial);
  }
}
