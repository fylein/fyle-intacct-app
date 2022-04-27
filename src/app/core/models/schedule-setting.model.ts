/* tslint:disable */
// TODO: Use something for serialization / deserialization
export type ScheduleSettings = {
  id: number;
  workspace: number;
  enabled: boolean;
  start_datetime: Date;
  interval_hours: number;
  schedule: number;
  emails_selected: [];
  additional_email_options:[];
};
