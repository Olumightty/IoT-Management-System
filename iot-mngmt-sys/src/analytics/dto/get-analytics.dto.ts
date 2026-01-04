import { IsDateString, IsString, IsUUID } from 'class-validator';

export class GetAnalyticsDto {
  @IsUUID()
  deviceId: string;
  @IsString()
  appliance: string;
  @IsDateString()
  from: string;
  @IsDateString()
  to: string;
}
