import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, onErrorResumeNext } from 'rxjs';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenseGroupsService } from 'src/app/core/services/expense-groups.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { WindowReferenceService } from 'src/app/core/services/window.service';
import { Count } from 'src/app/core/models/count.model';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { Configuration } from 'src/app/core/models/configuration.model';
import { SiComponent } from '../si.component';
import { CategoryMappingsResponse } from 'src/app/core/models/category-mapping-response.model';


const FYLE_URL = environment.fyle_url;
const FYLE_CLIENT_ID = environment.fyle_client_id;
const APP_URL = environment.app_url;

enum onboardingStates {
  initialized,
  fyleConnected,
  sageIntacctConnected,
  locationEntityMappingDone,
  configurationsDone,
  generalMappingsDone,
  employeeMappingsDone,
  categoryMappingsDone,
  isOnboarded
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss', '../si.component.scss']
})
export class DashboardComponent implements OnInit {
  workspaceId: number;
  isLoading = false;
  configuration: Configuration;

  currentState = onboardingStates.initialized;

  get allOnboardingStates() {
    return onboardingStates;
  }

  rippleDisabled = true;
  linearMode = true;

  successfulExpenseGroupsCount = 0;
  failedExpenseGroupsCount = 0;
  windowReference: Window;

  constructor(
    private expenseGroupService: ExpenseGroupsService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private mappingsService: MappingsService,
    private storageService: StorageService,
    private windowReferenceService: WindowReferenceService,
    private snackBar: MatSnackBar,
    private trackingService: TrackingService,
    private si: SiComponent
    ) {
      this.windowReference = this.windowReferenceService.nativeWindow;
    }

  connectFyle() {
    this.windowReference.location.href = `${FYLE_URL}/app/developers/#/oauth/authorize?client_id=${FYLE_CLIENT_ID}&redirect_uri=${APP_URL}/workspaces/fyle/callback&response_type=code&state=${this.workspaceId}`;
  }

  onConnectSageIntacctPageVisit(onboarding: boolean = false) {
    this.trackingService.onPageVisit('Connect Sage-Intacct', onboarding);
  }

  onConfigurationsPageVisit(onboarding: boolean = false) {
    this.trackingService.onPageVisit('Configurations', onboarding);
  }

  onGeneralMappingsPageVisit(onboarding: boolean = false) {
    this.trackingService.onPageVisit('Genral Mappings', onboarding);
  }

  onEmployeeMappingsPageVisit(onboarding: boolean = false) {
    this.trackingService.onPageVisit('Employee Mappings', onboarding);
  }

  onCategoryMappingsPageVisit(onboarding: boolean = false) {
    this.trackingService.onPageVisit('Category Mappings', onboarding);
  }

  // TODO: remove promises and do with rxjs observables
  checkFyleLoginStatus() {
    const that = this;
    return that.settingsService.getFyleCredentials(that.workspaceId).toPromise().then(credentials => {
      that.currentState = onboardingStates.fyleConnected;
      return credentials;
    });
  }

  // TODO: remove promises and do with rxjs observables
  getSageIntacctStatus() {
    const that = this;

    return that.settingsService.getSageIntacctCredentials(that.workspaceId).toPromise().then(credentials => {
      that.currentState = onboardingStates.sageIntacctConnected;
      return credentials;
    });
  }

  getLocationEntityMapping() {
    const that = this;
    return that.mappingsService.getLocationEntityMapping().toPromise().then(locationEntityMapping => {
      that.currentState = onboardingStates.locationEntityMappingDone;
      return locationEntityMapping;
    });
  }

  getConfigurations() {
    const that = this;
    // TODO: remove promises and do with rxjs observables
    return forkJoin(
      [
        that.settingsService.getConfiguration(that.workspaceId),
        that.settingsService.getMappingSettings(that.workspaceId)
      ]
    ).toPromise().then((res) => {
      that.configuration = res[0];
      that.currentState = onboardingStates.configurationsDone;
      return res;
    });
  }

  getGeneralMappings() {
    const that = this;
    // TODO: remove promises and do with rxjs observables
    return that.mappingsService.getGeneralMappings().toPromise().then((res) => {
      that.currentState = onboardingStates.generalMappingsDone;
      return res;
    });
  }

  getEmployeeMappings() {
    const that = this;
    // TODO: remove promises and do with rxjs observables
    if (that.configuration && (that.configuration.auto_create_destination_entity || !that.configuration.reimbursable_expenses_object)) {
      that.currentState = onboardingStates.employeeMappingsDone;
      return;
    } else {
      return that.mappingsService.getEmployeeMappings(1, 0).toPromise().then((res) => {
        if (res.results.length > 0) {
          that.currentState = onboardingStates.employeeMappingsDone;
        } else {
          throw new Error('employee mappings have no entries');
        }
        return res;
      });
    }
  }

  getCategoryMappings() {
    const that = this;
    // TODO: remove promises and do with rxjs observables
    return that.mappingsService.getCategoryMappings(1, 0).toPromise().then((categoryMappingResponse: CategoryMappingsResponse) => {
      if (categoryMappingResponse.results.length > 0) {
        that.currentState = onboardingStates.categoryMappingsDone;
      } else {
        throw new Error('cateogry mappings have no entries');
      }
      return categoryMappingResponse;
    });
  }

  loadSuccessfullExpenseGroupsCount() {
    const that = this;
    // TODO: remove promises and do with rxjs observables
    return that.expenseGroupService.getExpenseGroupCountByState('COMPLETE').toPromise().then((res: Count) => {
      that.successfulExpenseGroupsCount = res.count;
      return res;
    });
  }

  loadFailedlExpenseGroupsCount() {
    const that = this;
    // TODO: remove promises and do with rxjs observables
    return that.expenseGroupService.getExpenseGroupCountByState('FAILED').toPromise().then((res: Count) => {
      that.failedExpenseGroupsCount = res.count;
      return res;
    });
  }

  loadDashboardData() {
    const that = this;
    that.isLoading = true;
    // TODO: remove promises and do with rxjs observables
    return forkJoin([
      that.loadSuccessfullExpenseGroupsCount(),
      that.loadFailedlExpenseGroupsCount()
    ]).toPromise().then(() => {
      that.isLoading = false;
      return true;
    });
  }

  syncDimension() {
    const that = this;

    that.mappingsService.refreshDimension();

    that.snackBar.open('Refreshing Fyle and Sage Intacct Data');
  }

  // to be callled in background whenever dashboard is opened for syncing fyle data for org
  updateDimensionTables() {
    const that = this;

    that.mappingsService.syncFyleDimensions().subscribe(() => {});
    that.mappingsService.syncSageIntacctDimensions().subscribe(() => {});
  }

  openSchedule(event) {
    const that = this;
    event.preventDefault();
    that.windowReference.open(`workspaces/${that.workspaceId}/settings/schedule`, '_blank');
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = +that.route.snapshot.params.workspace_id;
    const onboarded = that.storageService.get('onboarded');

    if (onboarded === true) {
      that.currentState = onboardingStates.isOnboarded;
      that.updateDimensionTables();
      that.loadDashboardData();
    } else {
      that.isLoading = true;
      that.checkFyleLoginStatus()
        .then(() => {
          return that.getSageIntacctStatus();
        }).then(() => {
          return that.getLocationEntityMapping();
        }).then(() => {
          that.updateDimensionTables();
          return that.getConfigurations();
        }).then(() => {
          return that.getGeneralMappings();
        }).then(() => {
          return that.getEmployeeMappings();
        }).then(() => {
          return that.getCategoryMappings();
        }).then(() => {
          that.currentState = onboardingStates.isOnboarded;
          that.storageService.set('onboarded', true);
          that.si.hideRefreshIconVisibility();
          return that.loadDashboardData();
        }).catch(() => {
          // do nothing as this just means some steps are left
          that.storageService.set('onboarded', false);
        }).finally(() => {
          that.isLoading = false;
        });
    }

  }

}
