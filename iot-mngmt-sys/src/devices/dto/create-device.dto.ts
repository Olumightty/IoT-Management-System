import { ApiProperty } from '@nestjs/swagger';
import {
  IsMACAddress,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
export class CreateDeviceDto {
  @ApiProperty()
  @IsMACAddress()
  @IsNotEmpty()
  mac_address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
