import { Component, OnInit } from '@angular/core';
import { ExpenseGroupsService } from 'src/app/core/services/expense-groups.service';
import { ActivatedRoute } from '@angular/router';
import { TasksService } from 'src/app/core/services/tasks.service';
import { Task } from 'src/app/core/models/task.model';
import { MappingsService } from '../../../core/services/mappings.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.scss', '../../si.component.scss']
})
export class SyncComponent implements OnInit {

  workspaceId: number;
  lastTask: Task;
  isLoading: boolean;
  isExpensesSyncing: boolean;
  isEmployeesSyncing: boolean;
  errorOccurred = false;

  constructor(private expenseGroupService: ExpenseGroupsService, private route: ActivatedRoute, private taskService: TasksService, private mappingService: MappingsService, private snackBar: MatSnackBar) { }

  syncExpenses() {
    const that = this;
    that.isExpensesSyncing = true;
    that.expenseGroupService.syncExpenseGroups().subscribe((res) => {
      that.updateLastSyncStatus();
      that.snackBar.open('Importing Complete');
      that.isExpensesSyncing = false;
    }, (error) => {
      that.isExpensesSyncing = false;
      that.snackBar.open('Importing Failed');
      that.errorOccurred = true;
    });
  }

  updateLastSyncStatus() {
    const that = this;
    that.isLoading = true;
    that.taskService.getTasks(1, 0, 'ALL').subscribe((res) => {
      if (res.count > 0) {
        that.lastTask = res.results[0];
      }
      that.isLoading = false;
    });
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = +that.route.parent.snapshot.params.workspace_id;

    that.isExpensesSyncing = false;
    this.updateLastSyncStatus();
  }

}
