/* tslint:disable */
import { EmployeeMapping } from './employee-mapping.model';

export type EmployeeMappingsResponse = {
  count: number;
  next: string;
  previous: string;
  results: EmployeeMapping[];
};
