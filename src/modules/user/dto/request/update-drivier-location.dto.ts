import { ApiProperty } from "@nestjs/swagger";
import { IsLatitude } from "class-validator";

export class UpdateDriverLocationDto {
    @ApiProperty()
    @IsLatitude()
    latitude: number
    @ApiProperty()
    @IsLatitude()
    longitude: number
}