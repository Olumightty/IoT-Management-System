import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { IoTDeviceModule } from 'src/repositories/iotdevice/iotdevice.module';
import { ApplianceModule } from 'src/repositories/appliance/appliance.module';

@Module({
  imports: [IoTDeviceModule, ApplianceModule],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
