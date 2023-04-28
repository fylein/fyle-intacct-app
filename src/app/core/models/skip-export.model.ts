/* tslint:disable */

export type SkipExport = {
    condition: string;
    custom_field_type: any;
    operator: 'isnull' | 'iexact' | 'icontains' | 'lt' | 'lte';
    values: string[];
    rank: number;
    join_by: 'AND' | 'OR';
    is_custom: boolean;
  };
  