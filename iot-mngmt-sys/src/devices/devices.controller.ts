import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { UpdateApplianceDto } from './dto/update-appliance.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import type { Request } from 'express';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post('pair')
  @UseGuards(AuthGuard)
  createDevice(@Body() createDeviceDto: CreateDeviceDto, @Req() req: Request) {
    return this.devicesService.createDevice(createDeviceDto, req['user'].sub);
  }

  @Get()
  @UseGuards(AuthGuard)
  getDevices(@Req() req: Request) {
    return this.devicesService.getDevices(req['user'].sub);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  removeDevice(@Param('id') id: string, @Req() req: Request) {
    return this.devicesService.removeDevice(id, req['user'].sub);
  }

  @Get(':id/appliances')
  @UseGuards(AuthGuard)
  getAppliances(@Param('id') id: string, @Req() req: Request) {
    return this.devicesService.getAppliances(id, req['user'].sub);
  }

  @Post(':id/appliances')
  @UseGuards(AuthGuard)
  createAppliance(
    @Param('id') id: string,
    @Body() createApplianceDto: CreateApplianceDto,
    @Req() req: Request,
  ) {
    return this.devicesService.createAppliance(
      createApplianceDto,
      id,
      req['user'].sub,
    );
  }

  @Delete(':id/appliances/:slug')
  @UseGuards(AuthGuard)
  removeAppliance(
    @Param('id') id: string,
    @Param('slug') slug: string,
    @Req() req: Request,
  ) {
    return this.devicesService.removeAppliance(id, slug, req['user'].sub);
  }
}
