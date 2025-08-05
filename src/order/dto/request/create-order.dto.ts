import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'uuid-of-truck-type' })
  @IsUUID()
  truck_type_id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  trucks_count: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  package_price: number;

  @ApiProperty({ example: 'uuid-of-package-type' })
  @IsUUID()
  package_type: string;

  @ApiProperty({ example: '5' })
  @IsString()
  package_weight: string;

  @ApiProperty({ example: 'Some description about the package', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  pickup_address_id: string;

  @ApiProperty()
  @IsString()
  delivery_address_id: string;



  @ApiProperty({ example: false })
  @IsBoolean()
  is_fragile: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  needs_cooling: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  needs_freezing: boolean;

  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  recipient_name?: string;

  @ApiProperty({required:false})
  @IsOptional()
  @IsString()
  recipient_phone?: string;
}
