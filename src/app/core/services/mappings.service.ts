import { Injectable } from '@angular/core';
import { Cacheable, CacheBuster } from 'ngx-cacheable';
import { empty, Observable, Subject, from } from 'rxjs';
import { concatMap, expand, map, publishReplay, refCount, reduce } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/api.service';
import { AttributeCount } from '../models/attribute-count.model';
import { ExpenseField } from '../models/expense-field.model';
import { GeneralMapping } from '../models/general-mapping.model';
import { MappingDestination } from '../models/mapping-destination.model';
import { MappingSource } from '../models/mapping-source.model';
import { MappingsResponse } from '../models/mappings-response.model';
import { GroupedDestinationAttributes } from '../models/grouped-destination-attributes';
import { Mapping } from '../models/mappings.model';
import { WorkspaceService } from './workspace.service';

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

  getFyleExpenseAttributes(attributeType: string): Observable<MappingSource[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/expense_attributes/`, {
      attribute_type: attributeType
    });
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

  getSageIntacctDestinationAttributes(attributeTypes: string | string[]): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/destination_attributes/`, {
      attribute_types: attributeTypes
    });
  }

  getSageIntacctAttributeCount(attributeType: string): Observable<AttributeCount> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/attributes/count/`, {
      attribute_type: attributeType
    });
  }

  getMappings(sourceType: string, uri: string = null, limit: number = 500, offset: number = 0, tableDimension: number = 2): Observable<MappingsResponse> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    const url = uri ? uri.split('/api')[1] : `/workspaces/${workspaceId}/mappings/?limit=${limit}&offset=${offset}&source_type=${sourceType}&table_dimension=${tableDimension}`;
    return this.apiService.get(url, {});
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

  getGroupedSageIntacctDestinationAttributes(attributeTypes: string[]): Observable<GroupedDestinationAttributes> {
    return from(this.getSageIntacctDestinationAttributes(attributeTypes).toPromise().then((response: MappingDestination[]) => {
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
      });
    }));
  }

  postSubsidiaryMappings(subsidiaryMappingPayload: any): Observable<any> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    console.log(subsidiaryMappingPayload)
    return this.apiService.post(`/workspaces/${workspaceId}/mappings/location_entity/`, subsidiaryMappingPayload);
  }

  getLocationEntityMapping(): Observable<any> {
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
}
