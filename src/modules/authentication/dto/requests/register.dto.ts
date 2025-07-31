import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  isStrongPassword,
} from 'class-validator';
import { Unique } from 'src/core/validators/unique-constraints.validator';
import { AcademicStage } from 'src/infrastructure/data/enums/academic-stage.enum';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';
import { Role } from 'src/infrastructure/data/enums/role.enum';


export class RegisterRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;



  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  @Unique('User')
  email?: string;
 

  // @ApiPropertyOptional({isArray:true})
  // @IsOptional()
  // grades_ids:string[]

 
  @ApiProperty({required:false,enum:Gender})
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender



  @ApiProperty()
  @IsOptional()
  @Unique('User')
  phone: string;

  @ApiProperty({ type: 'file', required: false })
  @IsOptional()
  avatarFile: Express.Multer.File;

  role:Role

}
    

export class RegisterDriverRequest extends RegisterRequest {
  @ApiProperty()
  @IsString()
  vehicle_type_id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  vehicle_registration_number: string;

  @ApiProperty()

  @IsString()
  driving_license_number: string;

  @ApiProperty({ type: 'file' })
  
  driving_license_image: Express.Multer.File;

  @ApiProperty({ type: 'file' })
  
  vehicle_registration_image: Express.Multer.File;

  //cities: string[];
  @ApiProperty()
  @IsOptional()
  @IsString({ each: true })
  cities: string[];
}