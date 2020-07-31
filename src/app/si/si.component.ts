import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { WorkspaceService } from '../core/services/workspace.service';
import { SettingsService } from '../core/services/settings.service';
import { StorageService } from '../core/services/storage.service';
import { WindowReferenceService } from '../core/services/window.service';

@Component({
  selector: 'app-si',
  templateUrl: './si.component.html',
  styleUrls: ['./si.component.scss']
})
export class SiComponent implements OnInit {
  user: any;
  orgsCount: number;
  workspace: any = {};
  isLoading = true;
  fyleConnected = false;
  companyName: string;
  generalSettings: any;
  mappingSettings: any;
  showSwitchOrg = false;
  navDisabled = true;
  windowReference: Window;
  connectSageIntacct = true;

  constructor(
    private workspaceService: WorkspaceService,
    private settingsService: SettingsService,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private windowReferenceService: WindowReferenceService) {
    this.windowReference = this.windowReferenceService.nativeWindow;
  }

  getGeneralSettings() {
    const that = this;
    forkJoin(
      [
        that.settingsService.getGeneralSettings(that.workspace.id),
        that.settingsService.getMappingSettings(that.workspace.id)
      ]
    ).subscribe((responses) => {
      that.generalSettings = responses[0];
      that.mappingSettings = responses[1].results;

      const employeeFieldMapping = that.mappingSettings.filter(
        setting => (setting.source_field === 'EMPLOYEE') &&
          (setting.destination_field === 'EMPLOYEE' || setting.destination_field === 'VENDOR')
      )[0];

      const projectFieldMapping = that.mappingSettings.filter(
        settings => settings.source_field === 'PROJECT'
      )[0];

      that.generalSettings.employee_field_mapping = employeeFieldMapping.destination_field;

      if (projectFieldMapping) {
        that.generalSettings.project_field_mapping = projectFieldMapping.destination_field;
      }

      that.storageService.set('generalSettings', that.generalSettings);
    });
  }

  switchWorkspace() {
    this.authService.switchWorkspace();
  }

  getSettingsAndNavigate() {
    const that = this;
    const pathName = that.windowReference.location.pathname;
    that.storageService.set('workspaceId', that.workspace.id);
    that.isLoading = false;
    if (pathName === '/workspaces') {
      that.router.navigateByUrl(`/workspaces/${that.workspace.id}/dashboard`);
    }
    that.getGeneralSettings();
    that.setupAccessiblePathWatchers();
  }

  getConfigurations() {
    const that = this;

    return forkJoin(
      [
        that.settingsService.getGeneralSettings(that.workspace.id),
        that.settingsService.getMappingSettings(that.workspace.id)
      ]
    ).toPromise();
  }

  setupAccessiblePathWatchers() {
    const that = this;
    that.getConfigurations().then(() => {
      that.navDisabled = false;
    }).catch(() => {
      // do nothing
    });

    that.router.events.subscribe(() => {
      const onboarded = that.storageService.get('onboarded');
      if (onboarded !== true) {
        that.getConfigurations().then(() => {
          that.navDisabled = false;
        }).catch(() => {
          // do nothing
        });
      }
    });
  }

  getSageIntacctCompanyName() {
    const that = this;
    that.settingsService.getSageIntacctCredentials(that.workspace.id).subscribe(res => {
      that.connectSageIntacct = false;
      that.companyName = res && res.si_company_name;
    })
  }

  setupWorkspace() {
    const that = this;
    that.user = that.authService.getUser();
    that.workspaceService.getWorkspaces(that.user.org_id).subscribe(workspaces => {
      if (Array.isArray(workspaces) && workspaces.length > 0) {
        that.workspace = workspaces[0];
        that.getSettingsAndNavigate();
      } else {
        that.workspaceService.createWorkspace().subscribe(workspace => {
          that.workspace = workspace;
          that.getSettingsAndNavigate();
        });
      }
      that.getSageIntacctCompanyName();
    });
  }

  ngOnInit() {
    const that = this;
    const onboarded = that.storageService.get('onboarded');
    that.navDisabled = onboarded !== true;
    that.orgsCount = that.authService.getOrgCount();
    that.setupWorkspace();
  }
}
