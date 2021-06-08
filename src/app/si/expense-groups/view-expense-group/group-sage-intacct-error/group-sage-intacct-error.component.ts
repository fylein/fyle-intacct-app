import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TasksService } from 'src/app/core/services/tasks.service';
import { ActivatedRoute } from '@angular/router';
import { Task } from 'src/app/core/models/task.model';
import { SageIntacctError } from 'src/app/core/models/sage-intacct-error.model';

@Component({
  selector: 'app-group-sage-intacct-error',
  templateUrl: './group-sage-intacct-error.component.html',
  styleUrls: ['./group-sage-intacct-error.component.scss', '../../../si.component.scss']
})
export class GroupSageIntacctErrorComponent implements OnInit {

  isLoading = false;
  expenseGroupId: number;
  workspaceId: number;
  count: number;

  sageIntacctErrors: MatTableDataSource<SageIntacctError> = new MatTableDataSource([]);
  columnsToDisplay = ['shortDescription', 'longDescription', 'correction'];

  constructor(private taskService: TasksService, private route: ActivatedRoute) { }

  ngOnInit() {
    const that = this;
    that.workspaceId = +that.route.snapshot.parent.params.workspace_id;
    that.expenseGroupId = +that.route.snapshot.parent.params.expense_group_id;
    that.isLoading = true;
    that.taskService.getTasksByExpenseGroupId(that.expenseGroupId).subscribe((res: Task) => {
      that.sageIntacctErrors = new MatTableDataSource(res.sage_intacct_errors);
      that.count = res.sage_intacct_errors && res.sage_intacct_errors.length;
      that.isLoading = false;
    });
  }
}
