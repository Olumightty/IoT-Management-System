import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UserService } from 'src/repositories/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/repositories/user/user.entity';
import { IoTDeviceService } from 'src/repositories/iotdevice/iotdevice.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly JWTService: JwtService,
    private readonly iotdeviceService: IoTDeviceService,
  ) {}
  async create(createAuthDto: CreateAuthDto) {
    const exist = await this.userService.findOne({
      email: createAuthDto.email,
    });
    if (exist) throw new ConflictException('Email already exists');
    try {
      const saltOrRounds = 10;
      const pwdHash = await bcrypt.hash(createAuthDto.password, saltOrRounds);

      const user = await this.userService.create({
        ...createAuthDto,
        password_hash: pwdHash,
        role: UserRole.ENGINEER,
      });

      const payload = { sub: user.id, role: UserRole.ENGINEER };
      const accessToken = await this.JWTService.signAsync(payload, {
        expiresIn: '15m',
      });
      const refreshToken = await this.JWTService.signAsync(payload, {
        expiresIn: '7d',
      });
      const refreshTokenHash = await bcrypt.hash(refreshToken, saltOrRounds);

      await this.userService.update(user.id, {
        refresh_token_hash: refreshTokenHash,
      });
      return {
        message: 'Registered successfully',
        accessToken,
        refreshToken,
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

  async login(email: string, password: string) {
    try {
      const user = await this.userService.findOne({ email });
      if (!user) throw new NotFoundException('Invalid credentials');
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) throw new ForbiddenException('Invalid credentials');
      const payload = { sub: user.id, role: user.role };
      const accessToken = await this.JWTService.signAsync(payload, {
        expiresIn: '15m',
      });
      const refreshToken = await this.JWTService.signAsync(payload, {
        expiresIn: '7d',
      });
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      await this.userService.update(user.id, {
        refresh_token_hash: refreshTokenHash,
      });
      return { message: 'Logged in successfully', accessToken, refreshToken };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { status: 500, message: 'Something went wrong' },
        500,
        { cause: error },
      );
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.JWTService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.userService.findOne({ id: payload.sub });
      if (!user) throw new NotFoundException('Invalid credentials');
      const isMatch = await bcrypt.compare(
        refreshToken,
        user.refresh_token_hash,
      );
      if (!isMatch) throw new ForbiddenException('Invalid credentials');

      const accessToken = await this.JWTService.signAsync(
        { sub: user.id, role: user.role },
        { expiresIn: '15m' },
      );
      return { accessToken };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        { status: 500, message: 'Something went wrong' },
        500,
        { cause: error },
      );
    }
  }

  async getUserProfile(id: string) {
    const user = await this.userService.findOne({ id });
    if (!user) throw new NotFoundException('User not found');
    return {
      data: user,
      message: 'User profile retrieved successfully',
    };
  }

  // Generate and store a security token for an IoT device in your database for authentication to the MQTT broker
  async generateDeviceToken(deviceId: string, userId: string) {
    const token = randomBytes(16).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);
    // Store the HASHED version in your Postgres 'Device' table
    await this.iotdeviceService.update(
      {
        id: deviceId,
        user_id: userId,
      },
      {
        security_token: hashedToken,
      },
    );
    return {
      token,
      message: 'Device token generated successfully',
    }; // Return the RAW token to the user ONLY ONCE
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
