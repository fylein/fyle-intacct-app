import { MappingDestination } from './mapping-destination.model';
import { MappingSource } from './mapping-source.model';

/* tslint:disable */
export type EmployeeMapping = {
  id?: number;
  source_employee: MappingSource;
  destination_employee?: MappingDestination;
  destination_vendor?: MappingDestination;
  destination_card_account?: MappingDestination;
  created_at?: Date;
  updated_at?: Date;
  workspace: number;
};
