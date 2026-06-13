import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
export class CreateAuthDto {
  @ApiProperty()
  @MinLength(2)
  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty()
  @MinLength(2)
  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  country: string; // ISO 3166-1 alpha-2 country code for localization and billing purposes
}
