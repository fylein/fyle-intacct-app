import { Injectable } from '@angular/core';
import { Cacheable, CacheBuster } from 'ngx-cacheable';
import { empty, Observable, Subject, from } from 'rxjs';
import { concatMap, expand, map, publishReplay, refCount, reduce } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/api.service';
import { AttributeCount } from '../models/attribute-count.model';
import { CategoryMappingsResponse } from '../models/category-mapping-response.model';
import { CategoryMapping } from '../models/category-mapping.model';
import { EmployeeMapping } from '../models/employee-mapping.model';
import { EmployeeMappingsResponse } from '../models/employee-mapping-response.model';
import { ExpenseField } from '../models/expense-field.model';
import { GeneralMapping } from '../models/general-mapping.model';
import { MappingDestination } from '../models/mapping-destination.model';
import { MappingSource } from '../models/mapping-source.model';
import { MappingsResponse } from '../models/mappings-response.model';
import { GroupedDestinationAttributes } from '../models/grouped-destination-attributes';
import { Mapping } from '../models/mappings.model';
import { WorkspaceService } from './workspace.service';
import { LocationEntityMapping } from '../models/location-entity-mapping.model';

const generalMappingsCache = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class MappingsService {
  destinationWorkspace: Observable<{}>;
  sourceWorkspace: Observable<{}>;

  constructor(
    private apiService: ApiService,
    private workspaceService: WorkspaceService) { }


  syncSageIntacctDimensions() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.destinationWorkspace) {
      this.destinationWorkspace = this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/sync_dimensions/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.destinationWorkspace;
  }

  syncFyleDimensions() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.sourceWorkspace) {
      this.sourceWorkspace = this.apiService.post(`/workspaces/${workspaceId}/fyle/sync_dimensions/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.sourceWorkspace;
  }

  refreshSageIntacctDimensions(dimensionsToSync: string[] = []) {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/refresh_dimensions/`, {
      dimensions_to_sync: dimensionsToSync
    });
  }

  refreshFyleDimensions() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.post(`/workspaces/${workspaceId}/fyle/refresh_dimensions/`, {});
  }

  refreshDimension() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/refresh_dimensions/`, {}).subscribe();
    this.apiService.post(`/workspaces/${workspaceId}/fyle/refresh_dimensions/`, {}).subscribe();
  }

  getFyleExpenseAttributes(attributeType: string, active?: boolean): Observable<MappingSource[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    const params: {attribute_type: string, active?: boolean} = {
      attribute_type: attributeType
    };

    if (active) {
      params.active = active;
    }

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/expense_attributes/`, params);
  }

  getSageIntacctFields(): Observable<ExpenseField[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/sage_intacct_fields/`, {});
  }

  getFyleFields(): Observable<ExpenseField[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/fyle_fields/`, {}
    );
  }

  getSageIntacctDestinationAttributes(attributeTypes: string | string[], accountType?: string, active?: boolean): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    const params: {attribute_types: string | string[], account_type?: string, active?: boolean} = {
      attribute_types: attributeTypes
    };

    if (accountType) {
      params.account_type = accountType;
    }
    if (active) {
      params.active = active;
    }

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/destination_attributes/`, params);
  }

  getSageIntacctAttributeCount(attributeType: string): Observable<AttributeCount> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/attributes/count/`, {
      attribute_type: attributeType
    });
  }

  getMappings(sourceType: string, uri: string = null, limit: number = 500, offset: number = 0, tableDimension: number = 2, sourceActive?: boolean): Observable<MappingsResponse> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    const params: {source_type: string, limit: number, offset: number, table_dimension: number, source_active?: boolean} = {
      source_type: sourceType,
      limit,
      offset,
      table_dimension: tableDimension
    };
    if (sourceActive) {
      params.source_active = sourceActive;
    }
    const url = uri ? uri.split('/api')[1] : `/workspaces/${workspaceId}/mappings/`;
    return this.apiService.get(url, params);
  }

  getAllMappings(sourceType: string): Observable<Mapping[]> {
    const that = this;
    return this.getMappings(sourceType).pipe(expand((res: MappingsResponse) => {
      // tslint:disable-next-line
      return res.next ? that.getMappings(sourceType, res.next) : empty();
    }), concatMap((res: MappingsResponse) => res.results),
      reduce((arr: Mapping[], val: Mapping) => {
        arr.push(val);
        return arr;
      }, []));
  }

  postMappings(mapping: Mapping): Observable<Mapping> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/mappings/`, mapping);
  }

  triggerAutoMapEmployees() {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/mappings/auto_map_employees/trigger/`, {});
  }


  getGroupedSageIntacctDestinationAttributes(attributeTypes: string[], accountType?: string, active?: boolean): Observable<GroupedDestinationAttributes> {
    return from(this.getSageIntacctDestinationAttributes(attributeTypes, accountType, active).toPromise().then((response: MappingDestination[]) => {
      return response.reduce((groupedAttributes: GroupedDestinationAttributes, attribute: MappingDestination) => {
        const group: MappingDestination[] = groupedAttributes[attribute.attribute_type] || [];
        group.push(attribute);
        groupedAttributes[attribute.attribute_type] = group;
        return groupedAttributes;
      }, {
        EXPENSE_TYPE: [],
        VENDOR: [],
        CLASS: [],
        CHARGE_CARD_NUMBER: [],
        ITEM: [],
        EMPLOYEE: [],
        ACCOUNT: [],
        LOCATION_ENTITY: [],
        CCC_ACCOUNT: [],
        EXPENSE_PAYMENT_TYPE: [],
        PAYMENT_ACCOUNT: [],
        DEPARTMENT: [],
        PROJECT: [],
        LOCATION: [],
        TAX_DETAIL: []
      });
    }));
  }

  getCategoryMappings(pageLimit: number, pageOffset: number): Observable<CategoryMappingsResponse> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.get(
      `/workspaces/${workspaceId}/mappings/category/`, {
        limit: pageLimit,
        offset: pageOffset,
        source_active : true
      }
    );
  }

  getEmployeeMappings(pageLimit: number, pageOffset: number): Observable<EmployeeMappingsResponse> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.get(
      `/workspaces/${workspaceId}/mappings/employee/`, {
        limit: pageLimit,
        offset: pageOffset
      }
    );
  }

  postCategoryMappings(mapping: CategoryMapping): Observable<Mapping> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/mappings/category/`, mapping);
  }

  postLocationEntityMapping(locationEntityMappingPayload: LocationEntityMapping): Observable<any> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.post(`/workspaces/${workspaceId}/mappings/location_entity/`, locationEntityMappingPayload);
  }

  getLocationEntityMapping(): Observable<LocationEntityMapping> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.get(
      `/workspaces/${workspaceId}/mappings/location_entity/`, {}
    );
  }

  @Cacheable({
    cacheBusterObserver: generalMappingsCache
  })
  getGeneralMappings(): Observable<GeneralMapping> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(
      `/workspaces/${workspaceId}/mappings/general/`, {}
    );
  }

  @CacheBuster({
    cacheBusterNotifier: generalMappingsCache
  })
  postGeneralMappings(mapping: GeneralMapping): Observable<GeneralMapping> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.post(
      `/workspaces/${workspaceId}/mappings/general/`, mapping
    );
  }

  postEmployeeMappings(employeeMapping: EmployeeMapping): Observable<EmployeeMapping> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/mappings/employee/`, employeeMapping);
  }
}
