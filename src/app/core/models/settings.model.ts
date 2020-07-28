import { ScheduleSettings } from './schedule-settings.model';

/* tslint:disable */
// TODO: Use something for serialization / deserialization
export class Settings {
  id: number;
  workspace: number;
  schedule: ScheduleSettings;
  created_at: Date;
  updated_at: Date;
}