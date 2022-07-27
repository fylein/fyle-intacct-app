/* tslint:disable */
import { CategoryMapping } from "./category-mapping.model";

export type CategoryMappingsResponse = {
  count: number;
  next: string;
  previous: string;
  results: CategoryMapping[];
};
