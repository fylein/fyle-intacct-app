import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, publishReplay, refCount } from 'rxjs/operators';
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
  fyleProjects: Observable<any[]>;
  sageIntacctDepartments: Observable<any[]>;
  fyleCostCenters: Observable<any[]>;
  accountPayables: Observable<any[]>;
  bankAccounts: Observable<any[]>;
  creditCardAccounts: Observable<any[]>;

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

  getSageIntacctVendors() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/vendors/`, {});
  }

  getSageIntacctChargeCard() {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/sage_intacct/charge_card_accounts/`, {});
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

  getMappings(sourceType): Observable<MappingsResponse> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.get(
      `/workspaces/${workspaceId}/mappings/`, {
        source_type: sourceType
      }
    );
  }

  postMappings(mapping: any) {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/mappings/`, mapping);
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
