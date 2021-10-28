import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { Cacheable, CacheBuster, globalCacheBusterNotifier } from 'ngx-cacheable';
import { FyleCredentials } from '../models/fyle-credentials.model';
import { SageIntacctCredentials } from '../models/si-credentials.model';
import { ScheduleSettings } from '../models/schedule-setting.model';
import { MappingSettingResponse } from '../models/mapping-setting-response.model';
import { Configuration } from '../models/configuration.model';
import { MappingSetting } from '../models/mapping-setting.model';
import { WorkspaceService } from './workspace.service';


const fyleCredentialsCache = new Subject<void>();
const sageIntacctCredentialsCache = new Subject<void>();
const configurationCache = new Subject<void>();
const mappingsSettingsCache = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private apiService: ApiService, private workspaceService: WorkspaceService) { }

  @Cacheable({
    cacheBusterObserver: fyleCredentialsCache
  })
  getFyleCredentials(): Observable<FyleCredentials> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.get(`/workspaces/${workspaceId}/credentials/fyle/`, {});
  }

  @Cacheable({
    cacheBusterObserver: sageIntacctCredentialsCache
  })
  getSageIntacctCredentials(): Observable<SageIntacctCredentials> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/credentials/sage_intacct/`, {});
  }

  @CacheBuster({
    cacheBusterNotifier: fyleCredentialsCache
  })
  connectFyle(authorizationCode: string): Observable<FyleCredentials> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/connect_fyle/authorization_code/`, {
      code: authorizationCode
    });
  }

  @CacheBuster({
    cacheBusterNotifier: sageIntacctCredentialsCache
  })
  connectSageIntacct(data: SageIntacctCredentials): Observable<SageIntacctCredentials> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    globalCacheBusterNotifier.next();
    return this.apiService.post(`/workspaces/${workspaceId}/credentials/sage_intacct/`, data);
  }

  postScheduleSettings(hours: number, scheduleEnabled: boolean): Observable<ScheduleSettings> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.post(`/workspaces/${workspaceId}/schedule/`, {
      hours,
      schedule_enabled: scheduleEnabled
    });
  }

  getScheduleSettings(): Observable<ScheduleSettings> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/schedule/`, {});
  }

  @Cacheable({
    cacheBusterObserver: mappingsSettingsCache
  })
  getMappingSettings(): Observable<MappingSettingResponse> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.get(`/workspaces/${workspaceId}/mappings/settings/`, {});
  }

  @CacheBuster({
    cacheBusterNotifier: configurationCache
  })
  postConfiguration(reimbursableExpensesObject: string, corporateCreditCardExpensesObject: string, importProjects: boolean, importCategories: boolean, fyleToSageIntacct: boolean, sageIntacctToFyle: boolean, autoCreateDestinationEntity: boolean, autoMapEmployees: string = null): Observable<Configuration> {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/configuration/`, {
      reimbursable_expenses_object: reimbursableExpensesObject,
      corporate_credit_card_expenses_object: corporateCreditCardExpensesObject,
      import_projects: importProjects,
      import_categories: importCategories,
      sync_fyle_to_sage_intacct_payments: fyleToSageIntacct,
      sync_sage_intacct_to_fyle_payments: sageIntacctToFyle,
      auto_map_employees: autoMapEmployees,
      auto_create_destination_entity: autoCreateDestinationEntity,
      workspace: workspaceId,
    });
  }

  @CacheBuster({
    cacheBusterNotifier: mappingsSettingsCache
  })
  postMappingSettings(mappingSettings: MappingSetting[]): Observable<MappingSetting[]> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.post(`/workspaces/${workspaceId}/mappings/settings/`, mappingSettings);
  }

  @Cacheable({
    cacheBusterObserver: configurationCache
  })
  getConfiguration(): Observable<Configuration> {
    const workspaceId = this.workspaceService.getWorkspaceId();

    return this.apiService.get(`/workspaces/${workspaceId}/configuration/`, {});
  }
}
