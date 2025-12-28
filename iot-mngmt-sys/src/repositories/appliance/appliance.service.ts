import { Injectable, Inject } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Appliance } from './appliance.entity';

@Injectable()
export class ApplianceService {
  constructor(
    @Inject('APPLIANCE_REPOSITORY')
    private applianceRepository: Repository<Appliance>,
  ) {}

  async create(iotdevice: Partial<Appliance>): Promise<Appliance> {
    return this.applianceRepository.save(iotdevice);
  }

  async findOne(where: FindOptionsWhere<Appliance>): Promise<Appliance | null> {
    return this.applianceRepository.findOneBy(where);
  }

  async findMany(where: Partial<Appliance>): Promise<Appliance[] | null> {
    return this.applianceRepository.find({ where });
  }

  async update(
    where: FindOptionsWhere<Appliance>,
    iotdevice: Partial<Appliance>,
  ): Promise<Appliance | null> {
    await this.applianceRepository.update(where, iotdevice);
    return this.findOne(where);
  }

  async remove(where: FindOptionsWhere<Appliance>): Promise<void> {
    await this.applianceRepository.delete(where);
  }
}
