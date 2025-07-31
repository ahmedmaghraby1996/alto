import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TruckSize } from './truck-size.entity';
import Joi from 'joi';

@Entity()
export class TruckType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @Column({ nullable: true })
  icon: string;

  @ManyToOne(() => TruckSize, (size) => size.types)
  @JoinColumn({ name: 'size_id' })
  size: TruckSize;
  @Column({ nullable: true })
  size_id: string;
}
