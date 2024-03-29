import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { WorkspaceService } from './workspace.service';

@Injectable({
  providedIn: 'root'
})
export class AppcuesService {

  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceService
  ) { }

  get appcues() {
    return (window as any).Appcues;
  }

  initialiseAppcues(): void {
    if (this.appcues) {
      const user = this.authService.getUser();
      this.appcues.identify(user.employee_email, {
        email: user.email,
        name: user.full_name,
        'Org ID': user.org_id,
        'Workspace ID': this.workspaceService.getWorkspaceId(),
        'Workspace Name': user.org_name,
        source: 'Fyle Intacct Integration'
      });
    }
  }
}
