import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class OrderReviewDto {
  @ApiProperty()
  order_id: string;
  @ApiProperty()
  @IsNumber()
  @Max(5)
  @Min(1)
  rate: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment: string;
}
