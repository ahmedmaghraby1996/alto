import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { TruckType } from './truck-type.entity';

@Entity()
export class TruckSize {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @Column()
  tonnage: number;

  @Column()
  min_length_m: number;

  @Column({nullable: true})
  icon: string

  @Column()
  max_length_m: number;

  @OneToMany(() => TruckType, (type) => type.size)
  types: TruckType[];
}
