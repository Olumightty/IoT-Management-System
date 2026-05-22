import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceDto } from './create-device.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  is_muted?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}
