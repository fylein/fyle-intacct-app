/* tslint:disable */

export type GeneralMapping = {
  id?: number;
  location_entity_name: string;
  location_entity_id: string;
  default_location_name: string;
  default_location_id: string;
  default_department_name: string;
  default_department_id: string;
  default_class_name: string;
  default_class_id: string;
  default_project_name: string;
  default_project_id: string;
  default_charge_card_name: string;
  default_charge_card_id: string;
  default_ccc_vendor_id: string;
  default_ccc_vendor_name: string;
  default_item_name: string;
  default_item_id: string;
  payment_account_id: string;
  payment_account_name: string;
  default_reimbursable_expense_payment_type_id: string;
  default_reimbursable_expense_payment_type_name: string;
  default_ccc_expense_payment_type_id: string;
  default_ccc_expense_payment_type_name: string;
  use_intacct_employee_departments: boolean;
  use_intacct_employee_locations: boolean;
  created_at?: Date;
  updated_at?: Date;
  workspace?: number;
};
