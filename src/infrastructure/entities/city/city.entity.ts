import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Country } from '../country/country.entity';



@Entity()
export class City extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @ManyToOne(() => Country, (country) => country.cities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ nullable: true })
  country_id: string;
  @Column({ nullable: true })
  order_by: number;
  

 
  constructor(partial?: Partial<City>) {
    super();
    Object.assign(this, partial);
  }
}
