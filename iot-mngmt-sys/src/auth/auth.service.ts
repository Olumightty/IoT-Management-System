import {
  ConflictException,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly JWTService: JwtService,
  ) {}
  async create(createAuthDto: CreateAuthDto) {
    const exist = await this.userService.findByEmail(createAuthDto.email);
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
      const user = await this.userService.findByEmail(email);
      if (!user) throw new NotFoundException('Invalid credentials');
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) throw new UnauthorizedException('Invalid credentials');
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
      const user = await this.userService.findOne(payload.sub);
      if (!user) throw new NotFoundException('Invalid credentials');
      const isMatch = await bcrypt.compare(
        refreshToken,
        user.refresh_token_hash,
      );
      if (!isMatch) throw new UnauthorizedException('Invalid credentials');

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

  async getUserProfile(payload: { sub: string }) {
    const user = await this.userService.findOne(payload.sub);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
