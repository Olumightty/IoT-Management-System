import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IoTDevice } from '../iotdevice/iotdevice.entity';

@Entity('appliances') // Explicitly naming the table is a best practice
@Index(['label', 'iot_device'], { unique: true })
export class Appliance {
  @PrimaryGeneratedColumn('uuid')
  // REMOVED: @Column({ unique: true }) id: string;
  id: string;

  @ManyToOne(() => IoTDevice, (iotdevice) => iotdevice.appliances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'iot_device_id' })
  iot_device: IoTDevice;

  @Column()
  iot_device_id: string;

  @Column()
  label: string;

  @Column({ type: 'float' }) // Using float for power ratings is safer for precision
  rated_power: number; // Fixed typo from 'reted_power'

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
