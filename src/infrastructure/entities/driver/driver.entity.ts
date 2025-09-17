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
  @Column({ nullable: true })
  user_id: string;
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

  @Column({
    type: 'enum',
    enum: IDType,
    default: IDType.NATIONAL_ID,
  })
  id_type: IDType;
  @Column({
    type: 'enum',
    default: DriverStatus.PENDING,
    enum: DriverStatus,
  })
  status: DriverStatus;

  @Column({ nullable: true })
  vehicle_registration_image: string;

  @Column({ type: 'float', precision: 11, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'float', precision: 11, scale: 6, nullable: true })
  longitude: number;

  @ManyToMany(() => City)
  cities: City[];

  @Column({ default: 0 })
  total_rating: number;
  @Column({ default: 0 })
  number_of_ratings: number;

  @Column({ default: false })
  vehicle_has_cooling: boolean;

  constructor(partial?: Partial<Driver>) {
    super();
    Object.assign(this, partial);
  }
}
