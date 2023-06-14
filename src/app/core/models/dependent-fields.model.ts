/* tslint:disable */

export interface DependentField extends DependentFieldPost {
    id: number;
    project_field_id: number;
    cost_code_field_id: number;
    cost_type_field_id: number;
    last_successful_import_at: string;
    created_at: string;
    updated_at: string;    
};

export type DependentFieldPost = {
    is_import_enabled: boolean;
    cost_code_field_name?: string;
    cost_type_field_name?: string;
    workspace: number;
}
