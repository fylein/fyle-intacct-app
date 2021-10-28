import { Component, OnInit } from '@angular/core';
import { ExpenseGroup } from 'src/app/core/models/expense-group.model';
import { ExpenseGroupsService } from 'src/app/core/services/expense-groups.service';
import { ActivatedRoute } from '@angular/router';
import { ExportsService } from 'src/app/core/services/exports.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { interval, from, forkJoin } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from 'src/app/core/services/settings.service';
import { WindowReferenceService } from 'src/app/core/services/window.service';
import { Configuration } from 'src/app/core/models/configuration.model';
import { TaskResponse } from 'src/app/core/models/task-reponse.model';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss', '../../si.component.scss']
})
export class ExportComponent implements OnInit {

  isLoading: boolean;
  isExporting: boolean;
  isProcessingExports: boolean;
  processingExportsCount: number;
  workspaceId: number;
  exportableExpenseGroups: ExpenseGroup[];
  configuration: Configuration;
  failedExpenseGroupCount = 0;
  successfulExpenseGroupCount = 0;
  exportedCount = 0;
  companyName: string;
  windowReference: Window;

  constructor(
    private route: ActivatedRoute,
    private taskService: TasksService,
    private expenseGroupService: ExpenseGroupsService,
    private snackBar: MatSnackBar,
    private settingsService: SettingsService,
    private exportsService: ExportsService,
    private windowReferenceService: WindowReferenceService) {
      this.windowReference = this.windowReferenceService.nativeWindow;
    }

  openFailedExports() {
    const that = this;
    this.windowReference.open(`workspaces/${that.workspaceId}/expense_groups?state=FAILED`, '_blank');
  }

  openSuccessfulExports() {
    const that = this;
    this.windowReference.open(`workspaces/${that.workspaceId}/expense_groups?state=COMPLETE`, '_blank');
  }

  checkResultsOfExport(filteredIds: number[]) {
    const that = this;
    interval(3000).pipe(
      switchMap(() => from(that.taskService.getAllTasks('ALL'))),
      takeWhile((response) => response.results.filter(task => (task.status === 'IN_PROGRESS' || task.status === 'ENQUEUED') && task.type !== 'FETCHING_EXPENSES' && filteredIds.includes(task.expense_group)).length > 0, true)
    ).subscribe((res) => {
      that.exportedCount = res.results.filter(task => (task.status !== 'IN_PROGRESS' && task.status !== 'ENQUEUED') && task.type !== 'FETCHING_EXPENSES' && filteredIds.includes(task.expense_group)).length;
      if (res.results.filter(task => (task.status === 'IN_PROGRESS' || task.status === 'ENQUEUED')  && task.type !== 'FETCHING_EXPENSES' && filteredIds.includes(task.expense_group)).length === 0) {
        that.taskService.getAllTasks('FAILED').subscribe((taskResponse) => {
          that.failedExpenseGroupCount = taskResponse.count;
          that.successfulExpenseGroupCount = filteredIds.length - that.failedExpenseGroupCount;
          that.isExporting = false;
          that.loadExportableExpenseGroups();
          that.snackBar.open('Export Complete');
        });
      }
    });
  }

  createSageIntacctItems() {
    const that = this;
    that.isExporting = true;
    that.settingsService.getConfiguration().subscribe((settings) => {
      that.configuration = settings;
      const promises = [];
      let allFilteredIds = [];
      if (that.configuration.reimbursable_expenses_object) {
        const filteredIds = that.exportableExpenseGroups.filter(expenseGroup => expenseGroup.fund_source === 'PERSONAL').map(expenseGroup => expenseGroup.id);
        if (filteredIds.length > 0) {
          promises.push(that.exportsService.triggerExports(filteredIds, that.configuration.reimbursable_expenses_object));
          allFilteredIds = allFilteredIds.concat(filteredIds);
        }
      }

      if (that.configuration.corporate_credit_card_expenses_object) {
        const filteredIds = that.exportableExpenseGroups.filter(expenseGroup => expenseGroup.fund_source === 'CCC').map(expenseGroup => expenseGroup.id);
        if (filteredIds.length > 0) {
          promises.push(that.exportsService.triggerExports(filteredIds, that.configuration.corporate_credit_card_expenses_object));

          allFilteredIds = allFilteredIds.concat(filteredIds);
        }
      }

      if (promises.length > 0) {
        forkJoin(
          promises
        ).subscribe(() => {
          that.checkResultsOfExport(allFilteredIds);
        });
      }
    });
  }

  loadExportableExpenseGroups() {
    const that = this;
    that.isLoading = true;
    that.expenseGroupService.getAllExpenseGroups('READY').subscribe((res) => {
      that.exportableExpenseGroups = res.results;
      that.isLoading = false;
    });
  }

  getSageIntacctCompanyName() {
    const that = this;
    that.settingsService.getSageIntacctCredentials().subscribe(res => {
      that.companyName = res && res.si_company_name;
    });
  }

  filterOngoingTasks(tasks: TaskResponse) {
    return tasks.results.filter(task => (task.status === 'IN_PROGRESS' || task.status === 'ENQUEUED') && task.type !== 'FETCHING_EXPENSES').length;
  }

  checkOngoingExports() {
    const that = this;

    that.isProcessingExports = true;
    interval(7000).pipe(
      switchMap(() => from(that.taskService.getAllTasks('ALL'))),
      takeWhile((response: TaskResponse) => that.filterOngoingTasks(response) > 0, true)
    ).subscribe((tasks: TaskResponse) => {
      that.processingExportsCount = that.filterOngoingTasks(tasks);
      if (that.filterOngoingTasks(tasks) === 0) {
        that.isProcessingExports = false;
        that.loadExportableExpenseGroups();
        that.snackBar.open('Export Complete');
      }
    });
  }

  reset() {
    const that = this;

    that.isExporting = false;
    that.isLoading = true;

    that.taskService.getAllTasks('ALL').subscribe((tasks: TaskResponse) => {
      that.isLoading = false;
      if (that.filterOngoingTasks(tasks) === 0) {
        that.loadExportableExpenseGroups();
      } else {
        that.processingExportsCount = that.filterOngoingTasks(tasks);
        that.checkOngoingExports();
      }
    });
  }

  ngOnInit() {
    const that = this;

    that.isExporting = false;
    that.workspaceId = +that.route.parent.snapshot.params.workspace_id;

    that.getSageIntacctCompanyName();
    that.reset();
  }

}
