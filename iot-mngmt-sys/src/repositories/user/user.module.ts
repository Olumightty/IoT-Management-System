import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UserService } from './user.service';
import { userProviders } from './user.provider';

@Module({
  providers: [...userProviders, UserService],
  imports: [DatabaseModule],
  exports: [UserService],
})
export class UserModule {}
