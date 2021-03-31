import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from 'src/app/core/services/api.service';
import { Cacheable, CacheBuster, globalCacheBusterNotifier } from 'ngx-cacheable';
import { FyleCredentials } from '../models/fyle-credentials.model';
import { SageIntacctCredentials } from '../models/si-credentials.model';
import { ScheduleSettings } from '../models/schedule-setting.model';
import { MappingSettingResponse } from '../models/mapping-setting-response.model';
import { GeneralSetting } from '../models/general-setting.model';
import { MappingSetting } from '../models/mapping-setting.model';

const fyleCredentialsCache = new Subject<void>();
const sageIntacctCredentialsCache = new Subject<void>();
const generalSettingsCache = new Subject<void>();
const mappingsSettingsCache = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private apiService: ApiService) { }

  @Cacheable({
    cacheBusterObserver: fyleCredentialsCache
  })
  getFyleCredentials(workspaceId: number): Observable<FyleCredentials> {
    return this.apiService.get('/workspaces/' + workspaceId + '/credentials/fyle/', {});
  }

  @Cacheable({
    cacheBusterObserver: sageIntacctCredentialsCache
  })
  getSageIntacctCredentials(workspaceId: number): Observable<SageIntacctCredentials> {
    return this.apiService.get('/workspaces/' + workspaceId + '/credentials/sage_intacct/', {});
  }

  @CacheBuster({
    cacheBusterNotifier: fyleCredentialsCache
  })
  connectFyle(workspaceId: number, authorizationCode: string): Observable<FyleCredentials> {
    return this.apiService.post('/workspaces/' + workspaceId + '/connect_fyle/authorization_code/', {
      code: authorizationCode
    });
  }

  @CacheBuster({
    cacheBusterNotifier: sageIntacctCredentialsCache
  })
  connectSageIntacct(workspaceId: number, data: SageIntacctCredentials): Observable<SageIntacctCredentials> {
    globalCacheBusterNotifier.next();
    return this.apiService.post('/workspaces/' + workspaceId + '/credentials/sage_intacct/', data);
  }

  postScheduleSettings(workspaceId: number, hours: number, scheduleEnabled: boolean): Observable<ScheduleSettings> {
    return this.apiService.post(`/workspaces/${workspaceId}/schedule/`, {
      hours,
      schedule_enabled: scheduleEnabled
    });
  }

  getScheduleSettings(workspaceId: number): Observable<ScheduleSettings> {
    return this.apiService.get(`/workspaces/${workspaceId}/schedule/`, {});
  }

  @Cacheable({
    cacheBusterObserver: mappingsSettingsCache
  })
  getMappingSettings(workspaceId: number): Observable<MappingSettingResponse> {
    return this.apiService.get(`/workspaces/${workspaceId}/mappings/settings/`, {});
  }

  @CacheBuster({
    cacheBusterNotifier: generalSettingsCache
  })
  postGeneralSettings(workspaceId: number, reimbursableExpensesObject: string, corporateCreditCardExpensesObject: string, importProjects: boolean, importCategories: boolean, fyleToSageIntacct: boolean, sageIntacctToFyle: boolean, autoCreateDestinationEntity: boolean, autoMapEmployees: string = null): Observable<GeneralSetting> {
    return this.apiService.post(`/workspaces/${workspaceId}/settings/general/`, {
      reimbursable_expenses_object: reimbursableExpensesObject,
      corporate_credit_card_expenses_object: corporateCreditCardExpensesObject,
      import_projects: importProjects,
      import_categories: importCategories,
      sync_fyle_to_sage_intacct_payments: fyleToSageIntacct,
      sync_sage_intacct_to_fyle_payments: sageIntacctToFyle,
      auto_map_employees: autoMapEmployees,
      auto_create_destination_entity: autoCreateDestinationEntity
    });
  }

  @CacheBuster({
    cacheBusterNotifier: mappingsSettingsCache
  })
  postMappingSettings(workspaceId: number, mappingSettings: MappingSetting[]): Observable<MappingSetting[]> {
    return this.apiService.post(`/workspaces/${workspaceId}/mappings/settings/`, mappingSettings);
  }

  @Cacheable({
    cacheBusterObserver: generalSettingsCache
  })
  getGeneralSettings(workspaceId: number): Observable<GeneralSetting> {
    return this.apiService.get(`/workspaces/${workspaceId}/settings/general/`, {});
  }
}
