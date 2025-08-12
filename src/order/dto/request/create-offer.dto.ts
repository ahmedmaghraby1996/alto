import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateOfferDto {
 @ApiProperty()
 @IsNotEmpty()
 price: number

 @ApiProperty()
 @IsNotEmpty()
 order_id: string
   
}