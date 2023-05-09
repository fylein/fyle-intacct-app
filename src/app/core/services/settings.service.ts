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
import { SkipExport } from '../models/skip-export.model';
import { ExpenseFilterResponse } from '../models/expense-filter-response.model';

const fyleCredentialsCache = new Subject<void>();
const sageIntacctCredentialsCache = new Subject<void>();
const configurationCache = new Subject<void>();
const mappingsSettingsCache = new Subject<void>();
const skipExportCache = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private apiService: ApiService, private workspace: WorkspaceService) { }

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

  postScheduleSettings(hours: number, scheduleEnabled: boolean, selectedEmail: [], addedEmail: {}): Observable<ScheduleSettings> {
    const workspaceId =  this.workspace.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/schedule/`, {
      hours,
      schedule_enabled: scheduleEnabled,
      added_email: addedEmail,
      selected_email: selectedEmail
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
    cacheBusterNotifier: configurationCache
  })
  postConfiguration(workspaceId: number, configurationPayload: Configuration): Observable<Configuration> {
    return this.apiService.post(`/workspaces/${workspaceId}/configuration/`, configurationPayload);
  }

  @CacheBuster({
    cacheBusterNotifier: configurationCache
  })
  patchConfiguration(workspaceId: number, memoStructure: string[]): Observable<Configuration> {
    return this.apiService.patch(`/workspaces/${workspaceId}/configuration/`, {
      memo_structure: memoStructure
    });
  }

  @CacheBuster({
    cacheBusterNotifier: mappingsSettingsCache
  })
  postMappingSettings(workspaceId: number, mappingSettings: MappingSetting[]): Observable<MappingSetting[]> {
    return this.apiService.post(`/workspaces/${workspaceId}/mappings/settings/`, mappingSettings);
  }

  @CacheBuster({
    cacheBusterNotifier: skipExportCache
  })
  postSkipExport(workspaceId: number, skipExport: SkipExport): Observable<SkipExport> {
    workspaceId = this.workspace.getWorkspaceId();
    return this.apiService.post(`/workspaces/${workspaceId}/fyle/expense_filters/`, skipExport);
  }

  @Cacheable({
    cacheBusterObserver: skipExportCache
  })
  getSkipExport(workspaceId: number): Observable<ExpenseFilterResponse> {
    workspaceId = this.workspace.getWorkspaceId();
    return this.apiService.get(`/workspaces/${workspaceId}/fyle/expense_filters/`, {});
  }

  @Cacheable({
    cacheBusterObserver: configurationCache
  })
  getConfiguration(workspaceId: number): Observable<Configuration> {
    return this.apiService.get(`/workspaces/${workspaceId}/configuration/`, {});
  }
}
