import {
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { IoTDeviceService } from 'src/repositories/iotdevice/iotdevice.service';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { ApplianceService } from 'src/repositories/appliance/appliance.service';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class DevicesService {
  constructor(
    private readonly iotDeviceService: IoTDeviceService,
    private readonly appliancesService: ApplianceService,
  ) {}
  async createDevice(createDeviceDto: CreateDeviceDto, userId: string) {
    try {
      const newDevice = await this.iotDeviceService.create({
        ...createDeviceDto,
        user_id: userId,
      });
      return {
        data: newDevice,
        message: 'Device created successfully',
      };
    } catch (error) {
      // Check if the error is a Foreign Key Violation
      if (error instanceof QueryFailedError) {
        throw new ConflictException();
      }
      console.log(error);
      throw new HttpException('Failed to create device', 500);
    }
  }

  async getDevices(userId: string) {
    try {
      const devices = await this.iotDeviceService.findMany({ user_id: userId });
      return {
        data: devices,
        message: 'Devices fetched successfully',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { status: 500, message: 'Something went wrong' },
        500,
        { cause: error },
      );
    }
  }

  async removeDevice(id: string, userId: string) {
    try {
      await this.iotDeviceService.remove({ id, user_id: userId });
      return {
        message: 'Device deleted successfully',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { status: 500, message: 'Something went wrong' },
        500,
        { cause: error },
      );
    }
  }

  async createAppliance(
    createApplianceDto: CreateApplianceDto,
    iot_device_id: string,
    userId: string,
  ) {
    try {
      const device = await this.iotDeviceService.findOne({
        id: iot_device_id,
        user_id: userId,
      });
      if (!device) throw new UnauthorizedException();
      const newAppliance = await this.appliancesService.create({
        ...createApplianceDto,
        iot_device_id,
      });
      return {
        data: newAppliance,
        message: 'Appliance created successfully',
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException();
      }
      console.log(error);
      throw new HttpException('Failed to create device', 500);
    }
  }

  async getAppliances(id: string, userId: string) {
    try {
      const device = await this.iotDeviceService.findOne({
        id,
        user_id: userId,
      });
      if (!device || !device?.appliances)
        return { data: [], message: 'No appliances found' };
      return {
        data: device.appliances,
        message: 'Appliances fetched successfully',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { status: 500, message: 'Something went wrong' },
        500,
        { cause: error },
      );
    }
  }

  async removeAppliance(id: string, slug: string, userId: string) {
    try {
      const device = await this.iotDeviceService.findOne({
        id,
        user_id: userId,
      });
      if (!device) throw new UnauthorizedException();
      await this.appliancesService.remove({ iot_device_id: id, label: slug });
      return {
        message: 'Appliance deleted successfully',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { status: 500, message: 'Something went wrong' },
        500,
        { cause: error },
      );
    }
  }
}
