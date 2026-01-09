export interface Device {
  id: string;
  label: string;
  mac_address: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Appliance {
  id: string;
  label: string;
  iot_device_id: string;
  rated_power: number;
  created_at: string;
  updated_at: string;
}
