import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class TrackingService {
  identityEmail: string;

  constructor(
  ) { }

  get tracking() {
    return (window as any).analytics;
  }

  eventTrack(action: string, properties= {}) {
    properties = {
      ...properties,
      Asset: 'Sage-Intacct Web'
    };
    if (this.tracking) {
      this.tracking.track(action, properties);
    }
  }

  onSignIn(email: string, workspaceId: number, properties) {
    if (this.tracking) {
      this.tracking.identify(email, {
        workspaceId,
      });
      this.identityEmail = email;
    }
    this.eventTrack('Sign In', properties);
  }

  onPageVisit(page: string, onboarding: boolean= false) {
    let event = `Visited ${page} Page`;
    event = onboarding ? `Onboarding: ${event}` : event;
    this.eventTrack(event);
  }

  onSignOut() {
    this.eventTrack('Sign Out');
  }

  onSwitchWorkspace() {
    this.eventTrack('Switching Workspace');
  }

  onModifyMemo(selectedFields) {
    this.eventTrack('Modifying Memo', selectedFields);
  }
}
