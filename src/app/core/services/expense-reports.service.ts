import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { WorkspaceService } from './workspace.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseReportsService {
  constructor(
    private apiService: ApiService,
    private workspaceService: WorkspaceService) {}

  createExpenseReports(expenseGroupIds: number[]) {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(
      `/workspaces/${workspaceId}/sage_intacct/expense_reports/trigger/`, {
        expense_group_ids: expenseGroupIds
      }
    );
  }
}
