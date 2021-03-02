/* tslint:disable */
// TODO: Use something for serialization / deserialization
import { MappingError } from './mapping-error.model';
import { SageIntacctError } from './sage-intacct-error.model';

export type Task = {
  bill: number;
  created_at: Date;
  detail: MappingError[];
  sage_intacct_errors: SageIntacctError[];
  expense_group: number;
  charge_card_transaction: number;
  ap_payment: number;
  sage_intacct_reimbursement: number;
  id: number;
  status: string;
  task_id: string;
  type: string;
  updated_at: Date;
  workspace: number;
};
