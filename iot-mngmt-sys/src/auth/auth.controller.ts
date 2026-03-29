import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  HttpCode,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import type { Request, Response } from 'express';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthGuard } from './guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(201)
  @Post('register')
  async create(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
    const result = await this.authService.create(createAuthDto);
    return res
      .cookie('refreshToken', result.refreshToken, { httpOnly: true })
      .send({ message: result.message, accessToken: result.accessToken });
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response, // Use passthrough: true!
  ) {
    console.log(`Login from`, loginAuthDto.email);
    const { accessToken, refreshToken, message } = await this.authService.login(
      loginAuthDto.email,
      loginAuthDto.password,
    );

    // passthrough: true lets you set the cookie but still return a plain object
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Security: only send over HTTPS in prod
      domain:
        process.env.NODE_ENV === 'production' ? '.ingress.ink' : undefined,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { message, accessToken };
  }

  @Post('refresh')
  @HttpCode(200)
  // Remove the standard AuthGuard if it checks the Access Token!
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.['refreshToken'] as string;
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token found');
    return this.authService.refresh(refreshToken);
  }

  @HttpCode(200)
  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Security: only send over HTTPS in prod
      domain:
        process.env.NODE_ENV === 'production' ? '.ingress.ink' : undefined,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 0,
    });
    return { message: 'Logged out successfully' };
  }

  @HttpCode(200)
  @Post('generate-device-token')
  @UseGuards(AuthGuard)
  generateDeviceToken(@Body() body: { deviceId: string }, @Req() req: Request) {
    return this.authService.generateDeviceToken(body.deviceId, req['user'].sub);
  }

  @HttpCode(200)
  @Get('profile')
  @UseGuards(AuthGuard)
  getUserProfile(@Req() req: Request) {
    return this.authService.getUserProfile(req['user'].sub);
  }

  @HttpCode(200)
  @Patch('profile')
  @UseGuards(AuthGuard)
  updateProfile(@Body() updateAuthDto: UpdateAuthDto, @Req() req: Request) {
    return this.authService.updateProfile(req['user'].sub, updateAuthDto);
  }

  @HttpCode(200) // Mosquitto expects 200 for success, 401/403 for failure
  @Post('mqtt/user')
  async validateMqttUser(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    console.log('MQTT Auth attempt for username:', username);
    // For the Superuser, we can allow it to bypass device credential checks
    if (
      username === process.env.MQTT_USERNAME &&
      password === process.env.MQTT_PASSWORD
    ) {
      return { status: 'allow' };
    }

    // 1. Username is your deviceId (UUID)
    // 2. Password is the raw secret token sent by the device
    const isValid = await this.authService.validateDeviceCredentials(
      username,
      password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid Device Credentials');
    }

    // Return 200 OK to allow Mosquitto to accept the connection
    return { status: 'allow' };
  }

  @Post('mqtt/superuser')
  @HttpCode(200)
  validateSuperuser(@Body() body: { username: string; password: string }) {
    const { username } = body;

    const isServer = username === process.env.MQTT_USERNAME;
    console.log(
      'Superuser check for username:',
      username,
      'isServer:',
      isServer,
    );
    if (!isServer) {
      throw new UnauthorizedException('Superuser Denied');
    }
    return { status: 'allow' };
  }

  @HttpCode(200)
  @Post('mqtt/acl')
  checkMqttAcl(@Body() body: { username: string; topic: string; acc: number }) {
    const { username, topic } = body;
    console.log('ACL check for username:', username, 'topic:', topic);
    // Logic: Ensure the topic starts with the device's own ID
    // Example topic: energy/dev-uuid-123/fridge/telemetry
    if (topic.includes(username)) {
      return { status: 'allow' };
    }

    // Deny access to topics that don't match the device ID
    throw new UnauthorizedException('ACL Denied');
  }
}
