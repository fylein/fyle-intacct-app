import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { WorkspaceService } from '../core/services/workspace.service';
import { SettingsService } from '../core/services/settings.service';
import { StorageService } from '../core/services/storage.service';
import { WindowReferenceService } from '../core/services/window.service';
import { UserProfile } from '../core/models/user-profile.model';
import { Workspace } from '../core/models/workspace.model';
import { Configuration } from '../core/models/configuration.model';
import { MappingSetting } from '../core/models/mapping-setting.model';
import { MappingsService } from '../core/services/mappings.service';
import { MatSnackBar } from '@angular/material';
import { MappingSettingResponse } from '../core/models/mapping-setting-response.model';
import { TrackingService } from '../core/services/tracking.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-si',
  templateUrl: './si.component.html',
  styleUrls: ['./si.component.scss']
})
export class SiComponent implements OnInit {
  user: {
    employee_email: string,
    full_name: string,
    org_id: string,
    org_name: string
  };
  orgsCount: number;
  workspace: Workspace;
  isLoading = true;
  fyleConnected: boolean;
  companyName: string;
  configuration: Configuration;
  mappingSettings: MappingSetting[];
  showSwitchOrg: boolean;
  navDisabled = true;
  windowReference: Window;
  connectSageIntacct = true;
  showRefreshIcon: boolean;
  showEmployeeMapping = true;

  constructor(
    private workspaceService: WorkspaceService,
    private settingsService: SettingsService,
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService,
    private windowReferenceService: WindowReferenceService,
    private trackingService: TrackingService,
    private snackBar: MatSnackBar,
    private mappingsService: MappingsService,
    ) {
    this.windowReference = this.windowReferenceService.nativeWindow;
  }

  getTitle(name: string) {
    return name.replace(/_/g, ' ');
  }


  refreshDashboardMappingSettings(mappingSettings: MappingSetting[]) {
    const that = this;

    that.mappingSettings = mappingSettings.filter(
      setting => (setting.source_field !== 'EMPLOYEE' && setting.source_field !== 'CATEGORY')
    );
    that.isLoading = false;
  }


  getGeneralSettings() {
    const that = this;
    that.getMappingSettings().then((mappingSettings: MappingSetting[]) => {
      that.refreshDashboardMappingSettings(mappingSettings);
    });
  }


  getMappingSettings() {
    const that = this;

    return that.settingsService.getMappingSettings(that.workspace.id).toPromise().then((mappingSetting: MappingSettingResponse) => {
      return mappingSetting.results;
    }, () => {
      that.isLoading = false;
    });
  }

  switchWorkspace() {
    this.authService.switchWorkspace();
    this.trackingService.onSwitchWorkspace();
  }

  getSettingsAndNavigate() {
    const that = this;
    const pathName = that.windowReference.location.pathname;

    that.storageService.set('workspaceId', that.workspace.id);

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
        that.settingsService.getConfiguration(that.workspace.id),
        that.settingsService.getMappingSettings(that.workspace.id)
      ]
    );
  }

  setupAccessiblePathWatchers() {
    const that = this;
    that.getConfigurations().subscribe((response) => {
      that.navDisabled = false;
      if (response[0].reimbursable_expenses_object != null || response[0].corporate_credit_card_expenses_object === 'JOURNAL_ENTRY') {
        this.showEmployeeMapping = true;
      } else {
        this.showEmployeeMapping = false;
      }
    });

    that.router.events.subscribe(() => {
      const onboarded = that.storageService.get('onboarded');
      if (onboarded !== true) {
        that.getConfigurations().subscribe((response) => {
          that.navDisabled = false;
          if (response[0].reimbursable_expenses_object != null || response[0].corporate_credit_card_expenses_object === 'JOURNAL_ENTRY') {
            this.showEmployeeMapping = true;
          } else {
            this.showEmployeeMapping = false;
          }
        });
      }
    });
  }

  getSageIntacctCompanyName() {
    const that = this;
    that.settingsService.getSageIntacctCredentials(that.workspace.id).subscribe(res => {
      that.connectSageIntacct = false;
      that.companyName = res && res.si_company_name;
    });
  }

  setupWorkspace() {
    const that = this;
    that.user = that.authService.getUser();
    that.workspaceService.getWorkspaces(that.user.org_id).subscribe(workspaces => {
      if (Array.isArray(workspaces) && workspaces.length > 0) {
        that.workspace = workspaces[0];
        that.setUserIdentity(that.user.employee_email, workspaces[0].id, {fullName: that.user.full_name});
        that.getSettingsAndNavigate();
        that.getSageIntacctCompanyName();
      } else {
        that.workspaceService.createWorkspace().subscribe(workspace => {
          that.workspace = workspace;
          that.setUserIdentity(that.user.employee_email, workspace.id, {fullName: that.user.full_name});
          that.getSettingsAndNavigate();
          that.getSageIntacctCompanyName();
        });
      }
    });
  }

  setUserIdentity(email: string, workspaceId: number, properties) {
    this.trackingService.onSignIn(email, workspaceId, properties);
  }

  onSignOut() {
    this.trackingService.onSignOut();
  }

  onConnectSageIntacctPageVisit() {
    this.trackingService.onPageVisit('Connect Sage-Intacct');
  }

  onConfigurationsPageVisit() {
    this.trackingService.onPageVisit('Configurations');
  }

  onGeneralMappingsPageVisit() {
    this.trackingService.onPageVisit('Genral Mappings');
  }

  onEmployeeMappingsPageVisit() {
    this.trackingService.onPageVisit('Employee Mappings');
  }

  onCategoryMappingsPageVisit() {
    this.trackingService.onPageVisit('Category Mappings');
  }

  syncDimension() {
    const that = this;
    that.mappingsService.refreshDimension();
    that.snackBar.open('Refreshing Fyle and Sage Intacct Data');
  }

  hideRefreshIconVisibility() {
    this.showRefreshIcon = false;
  }

  switchToNewApp(): void {
    this.windowReference.location.href = `${environment.fyle_url}/app/settings/#/integrations/native_apps`;
  }

  ngOnInit() {
    const that = this;
    const onboarded = that.storageService.get('onboarded');
    that.navDisabled = onboarded !== true;
    that.showRefreshIcon = !onboarded;
    that.orgsCount = that.authService.getOrgCount();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        /* tslint:disable */
        (window as any).Appcues && (window as any).Appcues.page();
      }
    });
    that.setupWorkspace();
  }
}
