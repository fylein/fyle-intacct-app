/* tslint:disable */
export type Configuration = {
  id: number;
  reimbursable_expenses_object: string;
  corporate_credit_card_expenses_object: string;
  import_projects?: boolean;
  import_categories: boolean;
  sync_fyle_to_sage_intacct_payments: boolean;
  sync_sage_intacct_to_fyle_payments: boolean;
  auto_map_employees: string;
  auto_create_destination_entity: boolean;
  memo_structure?: string[];
  import_tax_codes: boolean;
  created_at: Date;
  updated_at: Date;
  workspace: number;
};
