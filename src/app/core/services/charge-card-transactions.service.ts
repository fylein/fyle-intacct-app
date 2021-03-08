import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { WorkspaceService } from './workspace.service';

@Injectable({
  providedIn: 'root',
})
export class ChargeCardTransactionsService {
  constructor(
    private apiService: ApiService,
    private workspaceService: WorkspaceService) {}

  createChargeCardTransactions(expenseGroupIds: number[]) {
    const workspaceId = this.workspaceService.getWorkspaceId();
    return this.apiService.post(
      `/workspaces/${workspaceId}/sage_intacct/charge_card_transactions/trigger/`, {
        expense_group_ids: expenseGroupIds
      }
    );
  }
}
