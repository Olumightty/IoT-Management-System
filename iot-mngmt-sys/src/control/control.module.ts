import { Module } from '@nestjs/common';
import { ControlService } from './control.service';
import { ControlController } from './control.controller';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { IoTDeviceModule } from 'src/repositories/iotdevice/iotdevice.module';

@Module({
  imports: [MqttModule, IoTDeviceModule],
  controllers: [ControlController],
  providers: [ControlService],
})
export class ControlModule {}
