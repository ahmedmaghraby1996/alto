import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column, Entity } from 'typeorm';
@Entity('package_type')
export class PackageType extends AuditableEntity {
  @Column()
  name_ar: string;
  @Column()
  name_en: string;

  @Column({ nullable: true })
  icon: string;
}
