/* tslint:disable */
import { CategoryMapping } from "./category-mapping.model";
import { EmployeeMapping } from "./employee-mapping.model";
import { MappingRow } from "./mapping-row.model";
import { MappingSetting } from "./mapping-setting.model";

export type MappingModal = {
  workspaceId: number;
  rowElement?: MappingRow;
  employeeMappingRow?: EmployeeMapping;
  categoryMappingRow?: CategoryMapping;
  setting?: MappingSetting;
};
