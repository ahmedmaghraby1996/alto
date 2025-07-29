import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { User } from '../user/user.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { City } from '../city/city.entity';
import { DriverStatus } from 'src/infrastructure/data/enums/driver-status.enum';
@Entity()
export class Driver extends AuditableEntity {
  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  vehicle_type: string;

  @Column({ nullable: true })
  vehicle_registration_number: string;

  @Column({ nullable: true })
  driving_license_number: string;

  @Column({ nullable: true })
  driving_license_image: string;

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
