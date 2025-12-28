import { DataSource } from 'typeorm';
import { IoTDevice } from './iotdevice.entity';

export const iotdeviceProviders = [
  {
    provide: 'IOT_DEVICE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(IoTDevice),
    inject: ['DATA_SOURCE'],
  },
];
