import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsEnum } from 'class-validator';

export class CreateControlDto {
  @ApiProperty()
  @IsUUID()
  deviceId: string;
  @ApiProperty()
  @IsString()
  appliance: string;
  @ApiProperty({ enum: ['ON', 'OFF'] })
  @IsEnum(['ON', 'OFF'])
  command: 'ON' | 'OFF';
}
