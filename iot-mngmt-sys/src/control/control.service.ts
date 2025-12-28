import { Inject, Injectable } from '@nestjs/common';
import { CreateControlDto } from './dto/create-control.dto';
import { UpdateControlDto } from './dto/update-control.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ControlService {
  constructor(
    //Inject the MQTT service from the mqtt module
    @Inject('MQTT_CLIENT')
    private readonly mqttClient: ClientProxy,
  ) {}

  // async onModuleInit() {
  //   await this.mqttClient.connect();
  // }
  create(createControlDto: CreateControlDto) {
    return 'This action adds a new control';
  }

  findAll() {
    return `This action returns all control`;
  }

  findOne(id: number) {
    return `This action returns a #${id} control`;
  }

  update(id: number, updateControlDto: UpdateControlDto) {
    return `This action updates a #${id} control`;
  }

  remove(id: number) {
    return `This action removes a #${id} control`;
  }
}
