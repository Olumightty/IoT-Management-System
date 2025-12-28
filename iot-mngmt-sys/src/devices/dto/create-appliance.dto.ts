import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateApplianceDto {
  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  rated_power: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;
}
