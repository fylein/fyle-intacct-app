import { Injectable } from '@angular/core';
import { Cacheable, CacheBuster } from 'ngx-cacheable';
import { empty, Observable, from, Subject } from 'rxjs';
import { concatMap, expand, map, publishReplay, refCount, reduce } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/api.service';
import { ExpenseField } from '../models/expense-field.model';
import { GeneralMapping } from '../models/general-mapping.model';
import { MappingDestination } from '../models/mapping-destination.model';
import { MappingSource } from '../models/mapping-source.model';
import { MappingsResponse } from '../models/mappings-response.model';
import { Mapping } from '../models/mappings.model';
import { WorkspaceService } from './workspace.service';

const generalMappingsCache = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class MappingsService {
  fyleCategories: Observable<MappingSource[]>;
  fyleEmployees: Observable<MappingSource[]>;
  fyleProjects: Observable<MappingSource[]>;
  fyleExpenseCustomFields: Observable<MappingSource[]>;
  destinationWorkspace: Observable<{}>;
  fyleCostCenters: Observable<MappingSource[]>;
  sageIntacctAccounts: Observable<MappingDestination[]>;
  sageIntacctChargeCardAccounts: Observable<MappingDestination[]>;
  sageIntacctVendors: Observable<MappingDestination[]>;
  sageIntacctEmployees: Observable<MappingDestination[]>;
  sageIntacctExpenseTypes: Observable<MappingDestination[]>;
  sageIntacctLocations: Observable<MappingDestination[]>;
  sageIntacctProjects: Observable<MappingDestination[]>;
  sageIntacctItems: Observable<MappingDestination[]>;
  sageIntacctDepartments: Observable<MappingDestination[]>;
  accountPayables: Observable<MappingDestination[]>;
  bankAccounts: Observable<MappingDestination[]>;
  creditCardAccounts: Observable<MappingDestination[]>;
  paymentAccounts: Observable<MappingDestination[]>;
  expenseFields: Observable<ExpenseField[]>;
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

    refreshSageIntacctDimensions() {
      const workspaceId = this.workspaceService.getWorkspaceId();

      return this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/refresh_dimensions/`, {});
    }

    refreshFyleDimensions() {
      const workspaceId = this.workspaceService.getWorkspaceId();

      return this.apiService.post(`/workspaces/${workspaceId}/fyle/refresh_dimensions/`, {});
    }

  postFyleEmployees(): Observable<MappingSource[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.fyleEmployees) {
      this.fyleEmployees = this.apiService.post(`/workspaces/${workspaceId}/fyle/employees/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.fyleEmployees;
  }

  postFyleCategories(): Observable<MappingSource[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.fyleCategories) {
      this.fyleCategories = this.apiService.post(`/workspaces/${workspaceId}/fyle/categories/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.fyleCategories;
  }

  postFyleProjects(): Observable<MappingSource[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.fyleProjects) {
      this.fyleProjects = this.apiService.post(`/workspaces/${workspaceId}/fyle/projects/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.fyleProjects;
  }

  postFyleCostCenters(): Observable<MappingSource[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.fyleCostCenters) {
      this.fyleCostCenters = this.apiService.post(`/workspaces/${workspaceId}/fyle/cost_centers/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.fyleCostCenters;
  }

  postExpenseCustomFields(): Observable<MappingSource[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.fyleExpenseCustomFields) {
      this.fyleExpenseCustomFields = this.apiService.post(`/workspaces/${workspaceId}/fyle/expense_custom_fields/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.fyleExpenseCustomFields;
  }

  postSageIntacctVendors(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.sageIntacctVendors) {
      this.sageIntacctVendors = this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/vendors/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.sageIntacctVendors;
  }

  postSageIntacctEmployees(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.sageIntacctEmployees) {
      this.sageIntacctEmployees = this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/employees/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.sageIntacctEmployees;
  }

  postSageIntacctExpensetypes(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.sageIntacctExpenseTypes) {
      this.sageIntacctExpenseTypes = this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/expense_types/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.sageIntacctExpenseTypes;
  }

  postSageIntacctItems(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.sageIntacctItems) {
      this.sageIntacctItems = this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/items/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.sageIntacctItems;
  }

  postSageIntacctLocations(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.sageIntacctLocations) {
      this.sageIntacctLocations = this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/locations/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.sageIntacctLocations;
  }

  postSageIntacctProjects(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.sageIntacctProjects) {
      this.sageIntacctProjects = this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/projects/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.sageIntacctProjects;
  }

  postSageIntacctAccounts(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.sageIntacctAccounts) {
      this.sageIntacctAccounts = this.apiService.post(
        `/workspaces/${workspaceId}/sage_intacct/accounts/`, {}).pipe(
          map(data => data),
          publishReplay(1),
          refCount()
        );
    }
    return this.sageIntacctAccounts;
  }

  postSageIntacctChargeCardAccounts(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.sageIntacctChargeCardAccounts) {
      this.sageIntacctChargeCardAccounts = this.apiService.post(
        `/workspaces/${workspaceId}/sage_intacct/charge_card_accounts/`, {}
      ).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.sageIntacctChargeCardAccounts;
  }

  postSageIntacctPaymentAccounts(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.paymentAccounts) {
      this.paymentAccounts = this.apiService.post(
        `/workspaces/${workspaceId}/sage_intacct/payment_accounts/`, {}
      ).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.paymentAccounts;
  }


  postSageIntacctDepartments(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    if (!this.sageIntacctDepartments) {
      this.sageIntacctDepartments = this.apiService.post(`/workspaces/${workspaceId}/sage_intacct/departments/`, {}).pipe(
        map(data => data),
        publishReplay(1),
        refCount()
      );
    }
    return this.sageIntacctDepartments;
  }

  getFyleEmployees(): Observable<MappingSource[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/employees/`, {});
  }

  getFyleCategories(): Observable<MappingSource[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/categories/`, {});
  }

  getFyleExpenseFields(): Observable<ExpenseField[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/expense_fields/`, {});
  }

  getSageIntacctVendors(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/vendors/`, {});
  }

  getSageIntacctChargeCard(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/charge_card_accounts/`, {});
  }

  getSageIntacctPaymentAccounts(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/payment_accounts/`, {});
  }

  getSageIntacctItems(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/items/`, {});
  }

  getSageIntacctEmployees(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/employees/`, {});
  }

  getSageIntacctExpensetypes(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/expense_types/`, {});
  }

  getSageIntacctDepartments(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/departments/`, {});
  }

  getSageIntacctLocations(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/locations/`, {});
  }

  getSageIntacctProjects(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/projects/`, {});
  }

  getSageIntacctAccounts(): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(
      `/workspaces/${workspaceId}/sage_intacct/accounts/`, {}
    );
  }

  getSageIntacctFields(): Observable<ExpenseField[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/sage_intacct_fields/`, {});
  }

  getFyleExpenseCustomFields(attributeType: string): Observable<MappingSource[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/expense_custom_fields/`, {
      attribute_type: attributeType
    });
  }

  getSageIntacctExpenseCustomFields(attributeType: string): Observable<MappingDestination[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/expense_custom_fields/`, {
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
