import { Module } from '@nestjs/common';
import { ControlService } from './control.service';
import { ControlController } from './control.controller';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [MqttModule],
  controllers: [ControlController],
  providers: [ControlService],
})
export class ControlModule {}
