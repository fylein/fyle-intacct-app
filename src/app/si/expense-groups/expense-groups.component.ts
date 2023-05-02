import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras, ActivationEnd } from '@angular/router';
import { ExpenseGroupsService } from '../../core/services/expense-groups.service';
import { ExpenseGroup } from 'src/app/core/models/expense-group.model';
import { MatTableDataSource } from '@angular/material/table';
import { SettingsService } from 'src/app/core/services/settings.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { WindowReferenceService } from 'src/app/core/services/window.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { Subscription } from 'rxjs';
import { Task } from 'src/app/core/models/task.model';
import { SkipExportLog } from 'src/app/core/models/skip-export-log.model';
import { SkipExportLogResponse } from 'src/app/core/models/skip-export-log-response.model';

@Component({
  selector: 'app-expense-groups',
  templateUrl: './expense-groups.component.html',
  styleUrls: ['./expense-groups.component.scss', '../si.component.scss'],
})
export class ExpenseGroupsComponent implements OnInit, OnDestroy {
  workspaceId: number;
  expenseGroups: MatTableDataSource<ExpenseGroup> = new MatTableDataSource([]);
  skippedExpenses: MatTableDataSource<SkipExportLog> = new MatTableDataSource([]);
  isLoading = true;
  isSkippedVisible = false;
  count: number;
  state: string;
  settings;
  pageNumber = 0;
  pageSize: number;
  columnsToDisplay1 = [];
  columnsToDisplay2 = [];
  windowReference: Window;
  routerEventSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private taskService: TasksService,

    private storageService: StorageService,
    private expenseGroupService: ExpenseGroupsService,
    private router: Router,
    private settingsService: SettingsService,
    private windowReferenceService: WindowReferenceService) {
      this.windowReference = this.windowReferenceService.nativeWindow;
    }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.state === 'SKIP') {
      this.skippedExpenses.filter = filterValue.trim().toLowerCase();
    } else {
      this.expenseGroups.filter = filterValue.trim().toLowerCase();
    }
  }

  getTitle(name: string) {
    if (name) {
      return name.replace(/_/g, ' ');
    }
  }

  onPageChange(event) {
    const that = this;

    that.isLoading = true;
    const navigationExtras: NavigationExtras = {
      queryParams: {
        page_number: event.pageIndex,
        page_size: event.pageSize,
        state: that.state
      }
    };

    that.router.navigate([`workspaces/${that.workspaceId}/expense_groups`], navigationExtras);
  }


  changeState(state: string) {
    const that = this;
    if (that.state !== state) {
      that.isLoading = true;
      const navigationExtras: NavigationExtras = {
        queryParams: {
          page_number: 0,
          page_size: that.pageSize,
          state
        }
      };

      that.router.navigate([`workspaces/${that.workspaceId}/expense_groups`], navigationExtras);
    }
  }

  getPaginatedExpenseGroups() {
    return this.expenseGroupService.getExpenseGroups(this.pageSize, this.pageNumber * this.pageSize, this.state).subscribe(expenseGroups => {
      this.count = expenseGroups.count;
      this.expenseGroups = new MatTableDataSource(expenseGroups.results);
      this.expenseGroups.filterPredicate = this.searchByText1;
      this.isLoading = false;
      return expenseGroups;
    });
  }

  goToExpenseGroup(id: number) {
    this.router.navigate([`workspaces/${this.workspaceId}/expense_groups/${id}/view`]);
  }

  setSkipLog() {
    const that = this;

    that.isSkippedVisible = true;
    return that.expenseGroupService.getSkipExportLogs(that.pageSize, that.pageNumber * that.pageSize).subscribe((skippedExpenses: SkipExportLogResponse) => {
      that.count = skippedExpenses.count;
      that.skippedExpenses = new MatTableDataSource(skippedExpenses.results);
      that.skippedExpenses.filterPredicate = that.searchByText2;
      that.isLoading = false;
      return skippedExpenses;
    });
  }

  reset() {
    const that = this;
    that.workspaceId = +that.route.snapshot.params.workspace_id;
    that.pageNumber = +that.route.snapshot.queryParams.page_number || 0;
    let cachedPageSize = that.storageService.get('expense-groups.pageSize') || 10;
    that.pageSize = +that.route.snapshot.queryParams.page_size || cachedPageSize;
    that.state = that.route.snapshot.queryParams.state || 'FAILED';
    that.settingsService.getConfiguration(that.workspaceId).subscribe((settings) => {
      if (that.state === 'COMPLETE') {
        that.columnsToDisplay1 = ['export-date', 'employee', 'export', 'expense-type', 'openSageIntacct'];
      } else if (that.state === 'FAILED') {
        that.columnsToDisplay1 = ['employee', 'expense-type'];
      } else if (that.state === 'SKIP') {
        that.columnsToDisplay2 = ['export-skipped-on', 'skippedEmployee', 'reference-id', 'skippedExpenseType'];
      }

      that.settings = settings;
      if (that.state === 'SKIP') {
        that.setSkipLog();
      } else {
        that.getPaginatedExpenseGroups();
      }
    });

    that.routerEventSubscription = that.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        const pageNumber = +event.snapshot.queryParams.page_number || 0;
        if (+event.snapshot.queryParams.page_size) {
          that.storageService.set('expense-groups.pageSize', +event.snapshot.queryParams.page_size);
          cachedPageSize = +event.snapshot.queryParams.page_size;
        }

        const pageSize = +event.snapshot.queryParams.page_size || cachedPageSize;
        const state = event.snapshot.queryParams.state || 'FAILED';

        if (that.pageNumber !== pageNumber || that.pageSize !== pageSize || that.state !== state) {
          if (state === 'COMPLETE') {
            that.columnsToDisplay1 = ['export-date', 'employee', 'export', 'expense-type', 'openSageIntacct'];
          } else if (state === 'FAILED') {
            that.columnsToDisplay1 = ['employee', 'expense-type'];
          } else if (state === 'SKIP') {
            that.columnsToDisplay2 = ['export-skipped-on', 'skippedEmployee', 'reference-id', 'skippedExpenseType'];
          }

          that.pageNumber = pageNumber;
          that.pageSize = pageSize;
          that.state = state;
          that.getPaginatedExpenseGroups();
        }
      }
    });
  }

  openInSageIntacct(id: string) {
      this.windowReference.open(`https://www-p02.intacct.com/ia/acct/ur.phtml?.r=${id}`, '_blank');
  }

  openInSiHandler(clickedExpenseGroup: ExpenseGroup) {
      // tslint:disable-next-line: deprecation
      event.preventDefault();
      // tslint:disable-next-line: deprecation
      event.stopPropagation();
      const that = this;
      that.isLoading = true;
      that.taskService.getTaskByExpenseGroupId(clickedExpenseGroup.id).subscribe((task: Task) => {
        that.isLoading = false;

        if (task.status === 'COMPLETE') {
          const redirectedId = task.detail.url_id;
          that.openInSageIntacct(redirectedId);
        }
      });
  }

  searchByText1(data: ExpenseGroup, filterText: string) {
    return data.description.employee_email.includes(filterText) ||
      ('Reimbursable'.toLowerCase().includes(filterText) && data.fund_source === 'PERSONAL') ||
      ('Corporate Credit Card'.toLowerCase().includes(filterText) && data.fund_source !== 'PERSONAL') ||
      data.description.claim_number.includes(filterText);
  }

  searchByText2(data: SkipExportLog, filterText: string) {
    return data.employee_email.includes(filterText);
  }

  ngOnInit() {
    this.reset();
    this.expenseGroups.filterPredicate = this.searchByText1;
    this.skippedExpenses.filterPredicate = this.searchByText2;
  }

  ngOnDestroy() {
    if (this.routerEventSubscription) {
      this.routerEventSubscription.unsubscribe();
    }
  }
}
