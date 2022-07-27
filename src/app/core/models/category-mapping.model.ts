import { MappingDestination } from './mapping-destination.model';
import { MappingSource } from './mapping-source.model';

/* tslint:disable */
export type CategoryMapping = {
  id?: number;
  source_category: MappingSource;
  destination_account?: MappingDestination;
  destination_expense_head?: MappingDestination;
  created_at?: Date;
  updated_at?: Date;
  workspace: number;
};
