import { Expose } from 'class-transformer';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity } from 'typeorm';
@Entity('package_type')
export class PackageType extends AuditableEntity {
  @Column()
  @Expose()
  name_ar: string;
  @Column()
  @Expose()
  name_en: string;
  @Column({ nullable: true })
  @Expose()
  icon: string;
}
