import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/repositories/user/user.module';
import { ConfigService } from '@nestjs/config';
import { IoTDeviceModule } from 'src/repositories/iotdevice/iotdevice.module';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '10m', // recommended
        },
      }),
    }),
  ],
  exports: [JwtModule],
})
class GlobalJwtModule {}

@Module({
  imports: [GlobalJwtModule, UserModule, IoTDeviceModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
