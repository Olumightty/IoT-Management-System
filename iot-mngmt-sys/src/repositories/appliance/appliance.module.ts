import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { applianceProviders } from './appliance.provider';
import { ApplianceService } from './appliance.service';

@Module({
  providers: [...applianceProviders, ApplianceService],
  imports: [DatabaseModule],
  exports: [ApplianceService],
})
export class ApplianceModule {}
