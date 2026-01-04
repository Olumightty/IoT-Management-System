import { Controller, Get, Post, Body } from '@nestjs/common';
import { ControlService } from './control.service';
import { CreateControlDto } from './dto/create-control.dto';

@Controller('control')
export class ControlController {
  constructor(private readonly controlService: ControlService) {}

  @Post()
  command(@Body() createControlDto: CreateControlDto) {
    return this.controlService.giveCommand(createControlDto);
  }

  @Get()
  status() {
    // return this.controlService.findAll();
  }
}
