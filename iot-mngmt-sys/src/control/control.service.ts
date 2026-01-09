import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateControlDto } from './dto/create-control.dto';
import { MqttService } from 'src/mqtt/mqtt.service';
import { IoTDeviceService } from 'src/repositories/iotdevice/iotdevice.service';

@Injectable()
export class ControlService {
  constructor(
    //Inject the MQTT service from the mqtt module
    private readonly mqttService: MqttService,
    private readonly iotDeviceService: IoTDeviceService,
  ) {}

  // async onModuleInit() {
  //   await this.mqttClient.connect();
  // }
  giveCommand(createControlDto: CreateControlDto, userId: string) {
    const device = this.iotDeviceService.findOne({
      id: createControlDto.deviceId,
      user_id: userId,
    });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    this.mqttService.publishCommand(
      createControlDto.deviceId,
      createControlDto.appliance,
      { state: createControlDto.command },
    );
    return {
      message: 'Command requested successfully',
    };
  }
}
