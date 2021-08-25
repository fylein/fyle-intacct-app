import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class TrackingService {
  identityEmail = null;

  constructor(
  ) { }

  get tracking() {
    return (window as any).analytics;
  }

  eventTrack(action, properties= {}) {
    properties = {
      ...properties,
      Asset: 'Sage-Intacct Web'
    };
    if (this.tracking) {
      this.tracking.track(action, properties);
    }
  }

  onSignIn(email: string, properties) {
    if (this.tracking) {
      this.tracking.identify(email, {
      });
      this.identityEmail = email;
    }
    this.eventTrack('Sign In', properties);
  }

  onConnectSageIntacctPageVisit(onboarding) {
    if (onboarding) {
      this.eventTrack('Onboarding: Visited Connect Sage-Intacct Page');
    }
  }

  onConfigurationsPageVisit(onboarding) {
    if (onboarding) {
      this.eventTrack('Onboarding: Visited Configurations Page');
    }
  }

  onGeneralMappingsPageVisit(onboarding) {
    if (onboarding) {
      this.eventTrack('Onboarding: Visited General Mapping Page');
    }
  }

  onEmployeeMappingsPageVisit(onboarding) {
    if (onboarding) {
      this.eventTrack('Onboarding: Visited Employee Mapping Page');
    }
  }

  onCategoryMappingsPageVisit(onboarding) {
    if (onboarding) {
      this.eventTrack('Onboarding: Visited Category Mapping Page');
    }
  }

  onSignOut() {
    this.eventTrack('Sign Out');
  }

  onSwitchWorkspace() {
    this.eventTrack('Switching Workspace');
  }
}
