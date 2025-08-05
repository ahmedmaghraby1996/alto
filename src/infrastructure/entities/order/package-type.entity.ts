import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { Column } from 'typeorm';

export class PackageType extends AuditableEntity {
  @Column()
  name_ar: string;
  @Column()
  name_en: string;

  @Column({ nullable: true })
  icon: string;
}
