import { Injectable, Inject } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { IoTDevice } from './iotdevice.entity';

@Injectable()
export class IoTDeviceService {
  constructor(
    @Inject('IOT_DEVICE_REPOSITORY')
    private iotdeviceRepository: Repository<IoTDevice>,
  ) {}

  async create(iotdevice: Partial<IoTDevice>): Promise<IoTDevice> {
    return this.iotdeviceRepository.save(iotdevice);
  }

  async findOne(where: FindOptionsWhere<IoTDevice>): Promise<IoTDevice | null> {
    return this.iotdeviceRepository.findOne({
      where,
      relations: { appliances: true },
    });
  }

  async findMany(where: Partial<IoTDevice>): Promise<IoTDevice[] | null> {
    return this.iotdeviceRepository.find({ where });
  }

  async update(
    where: FindOptionsWhere<IoTDevice>,
    iotdevice: Partial<IoTDevice>,
  ): Promise<IoTDevice | null> {
    await this.iotdeviceRepository.update(where, iotdevice);
    return this.findOne(where);
  }

  async remove(where: FindOptionsWhere<IoTDevice>): Promise<void> {
    await this.iotdeviceRepository.delete(where);
  }
}
