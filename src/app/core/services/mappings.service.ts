import { Injectable } from '@angular/core';
import { empty, Observable, from } from 'rxjs';
import { concatMap, expand, map, publishReplay, refCount, reduce } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/api.service';
import { MappingsResponse } from '../models/mappings-response.model';
import { WorkspaceService } from './workspace.service';

@Injectable({
  providedIn: 'root',
})
export class MappingsService {
  // TODO: Map models to each of these and the methods below
  fyleCategories: Observable<any[]>;
  sageIntacctAccounts: Observable<any[]>;
  sageIntacctChargeCardAccounts: Observable<any[]>;
  fyleEmployees: Observable<any[]>;
  sageIntacctVendors: Observable<any[]>;
  sageIntacctEmployees: Observable<any[]>;
  sageIntacctExpenseTypes: Observable<any[]>;
  sageIntacctLocations: Observable<any[]>;
  sageIntacctProjects: Observable<any[]>;
  sageIntacctItems: Observable<any[]>;
  fyleProjects: Observable<any[]>;
  fyleExpenseCustomFields: Observable<any[]>;
  sageIntacctDepartments: Observable<any[]>;
  fyleCostCenters: Observable<any[]>;
  accountPayables: Observable<any[]>;
  bankAccounts: Observable<any[]>;
  creditCardAccounts: Observable<any[]>;
  paymentAccounts: Observable<any[]>;
  expenseFields: Observable<any[]>;

  constructor(
    private apiService: ApiService,
    private workspaceService: WorkspaceService) { }

  postFyleEmployees() {
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

  postFyleCategories() {
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

  postFyleProjects() {
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

  postFyleCostCenters() {
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

  postExpenseCustomFields() {
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

  postSageIntacctVendors() {
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

  postSageIntacctEmployees() {
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

  postSageIntacctExpensetypes() {
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

  postSageIntacctItems() {
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

  postSageIntacctLocations() {
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

  postSageIntacctProjects() {
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

  postSageIntacctAccounts() {
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

  postSageIntacctChargeCardAccounts() {
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

  postSageIntacctPaymentAccounts() {
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


  postSageIntacctDepartments() {
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

  getFyleEmployees() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/employees/`, {});
  }

  getFyleCategories() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/categories/`, {});
  }

  getFyleExpenseFields() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/expense_fields/`, {});
  }

  getSageIntacctVendors() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/vendors/`, {});
  }

  getSageIntacctChargeCard() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/charge_card_accounts/`, {});
  }

  getSageIntacctPaymentAccounts() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/payment_accounts/`, {});
  }

  getSageIntacctItems() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/items/`, {});
  }

  getSageIntacctEmployees() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/employees/`, {});
  }

  getSageIntacctExpensetypes() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/expense_types/`, {});
  }

  getFyleProjects() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/projects/`, {});
  }

  getFyleCostCenters() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/cost_centers/`, {});
  }

  getSageIntacctDepartments() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/departments/`, {});
  }

  getSageIntacctLocations() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/locations/`, {});
  }

  getSageIntacctProjects() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/projects/`, {});
  }

  getSageIntacctAccounts() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(
      `/workspaces/${workspaceId}/sage_intacct/accounts/`, {}
    );
  }

  getSageIntacctFields() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/sage_intacct_fields/`, {});
  }

  getFyleExpenseCustomFields(attributeType: string) {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/fyle/expense_custom_fields/`, {
      attribute_type: attributeType
    });
  }

  getMappings(sourceType: string, limit: number = 500, uri: string = null): Observable<MappingsResponse> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    const url = uri ? uri.split('/api')[1] : `/workspaces/${workspaceId}/mappings/?limit=${limit}&offset=0&source_type=${sourceType}`;
    return this.apiService.get(url, {});
  }

  getAllMappings(sourceType: string) {
    const that = this;
    return this.getMappings(sourceType).pipe(expand((res: any) => {
      // tslint:disable-next-line
      return res.next ? that.getMappings(sourceType, 500, res.next) : empty();
    }), concatMap((res: any) => res.results),
      reduce((arr, val) => {
        arr.push(val);
        return arr;
      }, []));
  }

  postMappings(mapping: any) {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/mappings/`, mapping);
  }

  triggerAutoMapEmployees() {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/mappings/auto_map_employees/trigger/`, {});
  }

  getCategoryMappings() {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.get(
      `/workspaces/${workspaceId}/mappings/categories/`, {}
    );
  }

  getEmployeeMappings() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(
      `/workspaces/${workspaceId}/mappings/employees/`, {}
    );
  }

  getGeneralMappings() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(
      `/workspaces/${workspaceId}/mappings/general/`, {}
    );
  }

  postGeneralMappings(mapping: any) {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.post(
      `/workspaces/${workspaceId}/mappings/general/`, mapping
    );
  }
}
