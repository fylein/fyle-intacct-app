/* tslint:disable */

export type MappingSetting = {
  id?: number;
  source_field: string;
  destination_field: string;
  is_custom?: boolean;
  import_to_fyle?: boolean;
  expense_field_id?: string;
  created_at?: Date;
  updated_at?: Date;
  workspace?: number;
};
