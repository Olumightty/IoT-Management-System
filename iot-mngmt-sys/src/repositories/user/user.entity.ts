import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IoTDevice } from '../iotdevice/iotdevice.entity';

export enum UserRole {
  ADMIN = 'admin',
  ENGINEER = 'engineer',
}

@Entity('users') // Explicit table naming for clarity
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column() // Prevents password leak in JSON responses
  password_hash: string;

  @Column({ nullable: true })
  refresh_token_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ENGINEER,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // The 'onDelete' here is not necessary on the OneToMany side.
  // It is already handled by the @ManyToOne side in the Device entity.
  @OneToMany(() => IoTDevice, (iotdevice) => iotdevice.user)
  iot_devices: IoTDevice[];
}
