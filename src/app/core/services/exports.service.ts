import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { WorkspaceService } from './workspace.service';

@Injectable({
  providedIn: 'root',
})
export class ExportsService {
  constructor(
    private apiService: ApiService,
    private workspaceService: WorkspaceService) {}

  triggerExports(expenseGroupIds: number[], exportType: string) {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(
      `/workspaces/${workspaceId}/sage_intacct/exports/trigger/`, {
        expense_group_ids: expenseGroupIds,
        export_type: exportType
      }
    );
  }
}
