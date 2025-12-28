import { DataSource } from 'typeorm';
import { Appliance } from './appliance.entity';

export const applianceProviders = [
  {
    provide: 'APPLIANCE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Appliance),
    inject: ['DATA_SOURCE'],
  },
];
