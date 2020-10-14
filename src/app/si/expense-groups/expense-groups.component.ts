import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras, ActivationEnd } from '@angular/router';
import { ExpenseGroupsService } from '../../core/services/expense-groups.service';
import { ExpenseGroup } from 'src/app/core/models/expense-group.model';
import { MatTableDataSource } from '@angular/material/table';
import { SettingsService } from 'src/app/core/services/settings.service';
import { TasksService } from 'src/app/core/services/tasks.service';
import { environment } from 'src/environments/environment';
import { WindowReferenceService } from 'src/app/core/services/window.service';

@Component({
  selector: 'app-expense-groups',
  templateUrl: './expense-groups.component.html',
  styleUrls: ['./expense-groups.component.scss', '../si.component.scss'],
})
export class ExpenseGroupsComponent implements OnInit {
  workspaceId: number;
  expenseGroups: MatTableDataSource<ExpenseGroup> = new MatTableDataSource([]);
  isLoading = true;
  count: number;
  state: string;
  settings;
  pageNumber = 0;
  pageSize = 5;
  columnsToDisplay = ['description', 'employee', 'expense-type'];
  windowReference: Window;

  constructor(
    private route: ActivatedRoute,
    private taskService: TasksService,
    private expenseGroupService: ExpenseGroupsService,
    private router: Router,
    private settingsService: SettingsService,
    private windowReferenceService: WindowReferenceService) {
      this.windowReference = this.windowReferenceService.nativeWindow;
    }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.expenseGroups.filter = filterValue.trim().toLowerCase();
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
      this.expenseGroups.filterPredicate = this.searchByText;
      this.isLoading = false;
      return expenseGroups;
    });
  }

  goToExpenseGroup(id: number) {
    this.router.navigate([`workspaces/${this.workspaceId}/expense_groups/${id}/view`]);
  }

  reset() {
    const that = this;
    that.workspaceId = +that.route.snapshot.params.workspace_id;
    that.pageNumber = +that.route.snapshot.queryParams.page_number || 0;
    that.pageSize = +that.route.snapshot.queryParams.page_size || 5;
    that.state = that.route.snapshot.queryParams.state || 'FAILED';
    that.settingsService.getCombinedSettings(that.workspaceId).subscribe((settings) => {
      if (that.state === 'COMPLETE') {
        that.columnsToDisplay = ['export-date', 'description', 'employee', 'export', 'expense-type'];
      } else {
        that.columnsToDisplay = ['description', 'employee', 'expense-type'];
      }

      that.settings = settings;
      that.getPaginatedExpenseGroups();
    });

    that.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        const pageNumber = +event.snapshot.queryParams.page_number || 0;
        const pageSize = +event.snapshot.queryParams.page_size || 5;
        const state = event.snapshot.queryParams.state || 'FAILED';

        if (that.pageNumber !== pageNumber || that.pageSize !== pageSize || that.state !== state) {
          if (state === 'COMPLETE') {
            that.columnsToDisplay = ['export-date', 'description', 'employee', 'export', 'expense-type'];
          } else {
            that.columnsToDisplay = ['description', 'employee', 'expense-type'];
          }

          that.pageNumber = pageNumber;
          that.pageSize = pageSize;
          that.state = state;
          that.getPaginatedExpenseGroups();
        }
      }
    });
  }

  searchByText(data: ExpenseGroup, filterText: string) {
    return data.description.employee_email.includes(filterText) ||
      ('Reimbursable'.toLowerCase().includes(filterText) && data.fund_source === 'PERSONAL') ||
      ('Corporate Credit Card'.toLowerCase().includes(filterText) && data.fund_source !== 'PERSONAL') ||
      data.description.claim_number.includes(filterText);
  }

  ngOnInit() {
    this.reset();
    this.expenseGroups.filterPredicate = this.searchByText;
  }
}
