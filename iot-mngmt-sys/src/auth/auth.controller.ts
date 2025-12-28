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
    const { accessToken, refreshToken, message } = await this.authService.login(
      loginAuthDto.email,
      loginAuthDto.password,
    );

    // passthrough: true lets you set the cookie but still return a plain object
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Security: only send over HTTPS in prod
      sameSite: 'strict', // Security: Prevent CSRF
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
      sameSite: 'strict', // Security: Prevent CSRF
      maxAge: 0,
    });
    return { message: 'Logged out successfully' };
  }

  @HttpCode(200)
  @Get('profile')
  @UseGuards(AuthGuard)
  getUserProfile() {}
}
