import { TruckType } from 'src/infrastructure/entities/truck/truck-type.entity';
import { DataSource, Repository } from 'typeorm';
import { Seeder } from 'nestjs-seeder';
import { TruckSize } from 'src/infrastructure/entities/truck/truck-size.entity';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export  class TruckSeeder implements Seeder {
  
    constructor(
        @InjectRepository(TruckType)
        private readonly truckTypeRepo: Repository<TruckType>,
        @InjectRepository(TruckSize)
        private readonly truckSizeRepo: Repository<TruckSize>,
    ){}
  async seed(): Promise<void> {
    const sizes = [
      {
        name_ar: '8 طن – من 6م إلى 6.5م',
        name_en: '8 Ton – 6m to 6.5m',
        tonnage: 8,
        min_length_m: 6,
        max_length_m: 6.5,
        types: [
          {
            name_ar: 'جوانب',
            name_en: 'Sides',
            icon: 'lorry-sides.png',
          },
          {
            name_ar: 'صندوق مغلق',
            name_en: 'Closed Box',
            icon: 'lorry-box.png',
          },
          {
            name_ar: 'كرين 5 طن',
            name_en: 'Crane 5 Ton',
            icon: 'flatbed-crane-5t.png',
          },
          {
            name_ar: 'كرين 7 طن',
            name_en: 'Crane 7 Ton',
            icon: 'flatbed-crane-7t.png',
          },
          {
            name_ar: 'ثلاجة مبرد',
            name_en: 'Refrigerated',
            icon: 'lorry-fridge.png',
          },
        ],
      },
      {
        name_ar: 'دينّا',
        name_en: 'Dina',
        tonnage: 3.5,
        min_length_m: 3,
        max_length_m: 4,
        types: [
          {
            name_ar: 'دينّا عادية',
            name_en: 'Standard Dina',
            icon: 'dina.png',
          },
        ],
      },
    ];

    for (const size of sizes) {
      const truckSize = this.truckSizeRepo.create({
        name_ar: size.name_ar,
        name_en: size.name_en,
        tonnage: size.tonnage,
        min_length_m: size.min_length_m,
        max_length_m: size.max_length_m,
      });
      await this.truckSizeRepo.save(truckSize);

      for (const type of size.types) {
        const truckType = this.truckTypeRepo.create({
          name_ar: type.name_ar,
          name_en: type.name_en,
          icon: type.icon,
          size: truckSize,
        });
        await  this.truckTypeRepo.save(truckType);
      }
    }
  }

  async drop(): Promise<void> {

    console.log('City and country tables cleared.');
  }
}
