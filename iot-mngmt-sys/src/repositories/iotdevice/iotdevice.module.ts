import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { iotdeviceProviders } from './iotdevice.provider';
import { IoTDeviceService } from './iotdevice.service';

@Module({
  providers: [...iotdeviceProviders, IoTDeviceService],
  imports: [DatabaseModule],
  exports: [IoTDeviceService],
})
export class IoTDeviceModule {}
