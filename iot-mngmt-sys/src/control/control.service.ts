import { Injectable } from '@nestjs/common';
import { CreateControlDto } from './dto/create-control.dto';
import { MqttService } from 'src/mqtt/mqtt.service';

@Injectable()
export class ControlService {
  constructor(
    //Inject the MQTT service from the mqtt module
    private readonly mqttService: MqttService,
  ) {}

  // async onModuleInit() {
  //   await this.mqttClient.connect();
  // }
  giveCommand(createControlDto: CreateControlDto) {
    return this.mqttService.publishCommand(
      createControlDto.deviceId,
      createControlDto.appliance,
      { state: createControlDto.command },
    );
  }
}
