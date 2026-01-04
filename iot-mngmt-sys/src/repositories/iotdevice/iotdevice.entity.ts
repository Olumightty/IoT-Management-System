import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Appliance } from '../appliance/appliance.entity';

@Entity('iot_devices') // Explicit table naming
@Index(['label', 'user'], { unique: true })
export class IoTDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true }) // MAC addresses should usually be unique per device
  mac_address: string;

  @Column()
  label: string;

  @ManyToOne(() => User, (user) => user.iot_devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  security_token: string;

  // Note: OneToMany is a 'virtual' side for TypeORM.
  // The DB constraint is actually handled in the Appliance entity.
  @OneToMany(() => Appliance, (appliance) => appliance.iot_device)
  appliances: Appliance[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
