import { PartialType } from '@nestjs/mapped-types';
import { CreateApplianceDto } from './create-appliance.dto';
import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApplianceDto extends PartialType(CreateApplianceDto) {
  @ApiProperty()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  monthly_usage?: number;
}
