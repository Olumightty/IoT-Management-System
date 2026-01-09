import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ControlService } from './control.service';
import { CreateControlDto } from './dto/create-control.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import type { Request } from 'express';

@Controller('control')
export class ControlController {
  constructor(private readonly controlService: ControlService) {}
  
  @Post()
  @UseGuards(AuthGuard)
  command(@Body() createControlDto: CreateControlDto, @Req() req: Request) {
    return this.controlService.giveCommand(createControlDto, req['user'].sub);
  }

  @Get()
  @UseGuards(AuthGuard)
  status(@Req() req: Request) {
    // return this.controlService.findAll();
  }
}
