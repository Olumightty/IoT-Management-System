export type Command = "ON" | "OFF";

export interface ControlCommand {
  deviceId: string;
  appliance: string;
  command: Command;
}
