import { Component, OnInit } from '@angular/core';
import { MappingsService } from '../../../core/services/mappings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CategoryMappingsDialogComponent } from './category-mappings-dialog/category-mappings-dialog.component';
import { StorageService } from 'src/app/core/services/storage.service';
import { SettingsService } from 'src/app/core/services/settings.service';
import { forkJoin, from } from 'rxjs';
import { Configuration } from 'src/app/core/models/configuration.model';
import { MatTableDataSource } from '@angular/material';
import { CategoryMapping } from 'src/app/core/models/category-mapping.model';
import { CategoryMappingsResponse } from 'src/app/core/models/category-mapping-response.model';

@Component({
  selector: 'app-category-mappings',
  templateUrl: './category-mappings.component.html',
  styleUrls: ['./category-mappings.component.scss', '../settings.component.scss', '../../si.component.scss']
})
export class CategoryMappingsComponent implements OnInit {
  isLoading = false;
  workspaceId: number;
  categoryMappings: CategoryMapping[];
  categoryMappingRows: MatTableDataSource<CategoryMapping> = new MatTableDataSource([]);
  count: number;
  pageNumber: number;
  configuration: Configuration;
  columnsToDisplay = ['category', 'sageIntacct'];

  constructor(
    private mappingsService: MappingsService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    private storageService: StorageService,
    private settingsService: SettingsService) { }

  open(selectedItem: CategoryMapping = null) {
    const that = this;
    const dialogRef = that.dialog.open(CategoryMappingsDialogComponent, {
      width: '450px',
      data: {
        workspaceId: that.workspaceId,
        categoryMappingRow: selectedItem
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      const onboarded = that.storageService.get('onboarded');
      if (onboarded) {
        const data = {
          pageSize: that.storageService.get('mappings.pageSize') || 50,
          pageNumber: 0
        };
        that.reset(data);
      } else {
        that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
      }
    });
  }

  /**
   *
   * Possible combinations with category ccc mappings visibility
   *
   * ER - ER - No
   *
   * ER - BILL - Yes
   *
   * ER - CCT - Yes
   *
   * Bill - Bill - No
   *
   * Bill - CCT - No
   *
   * ER -  JE - Yes
   *
   * BILL - JE - No
   *
   * JE - ER - YES
   *
   * JE - BILL - NO
   *
   * JE - JE - NO
   *
   * JE - CCT - NO
   * @returns a boolean flag to show / hide ccc category mappings column.
   */
  showCCCOption() {
    const that = this;

    if (that.configuration.corporate_credit_card_expenses_object && that.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT' && that.configuration.corporate_credit_card_expenses_object !== 'EXPENSE_REPORT') {
      return true;
    }

    return false;
  }

  applyFilter(event: Event) {
    const that = this;
    const filterValue = (event.target as HTMLInputElement).value;
    that.categoryMappingRows.filter = filterValue.trim().toLowerCase();
  }

  searchByText(data: CategoryMapping, filterText: string) {
    return data.source_category.value.toLowerCase().includes(filterText) ||
    (data.destination_account ? data.destination_account.value.toLowerCase().includes(filterText) : false) ||
    (data.destination_expense_head ? data.destination_expense_head.value.toLowerCase().includes(filterText) : false);
  }

  reset(data) {
    const that = this;
    that.isLoading = true;

    that.mappingsService.getCategoryMappings(data.pageSize, data.pageSize * data.pageNumber).subscribe((response: CategoryMappingsResponse) => {
      that.categoryMappings = response.results;
      that.count = response.count;
      that.pageNumber = data.pageNumber;
      that.categoryMappingRows = new MatTableDataSource(that.categoryMappings);
      that.categoryMappingRows.filterPredicate = that.searchByText;
      that.isLoading = false;
    }, (err) => {
      that.isLoading = false;
    });
  }

  showSeparateCCCField() {
    const that = this;
    const settings = that.configuration;
    if (settings.corporate_credit_card_expenses_object && settings.corporate_credit_card_expenses_object !== 'EXPENSE_REPORT' && settings.reimbursable_expenses_object === 'EXPENSE_REPORT') {
      return true;
    }

    return false;
  }

  showExpenseTypeField() {
    const that = this;
    const settings = that.configuration;
    if (settings.corporate_credit_card_expenses_object && settings.corporate_credit_card_expenses_object === 'EXPENSE_REPORT' && settings.reimbursable_expenses_object === 'JOURNAL_ENTRY') {
      return true;
    }

    return false;
  }

  ngOnInit() {
    const that = this;
    that.isLoading = true;
    that.workspaceId = that.route.parent.snapshot.params.workspace_id;
    that.settingsService.getConfiguration(this.workspaceId).subscribe(settings => {
      that.configuration = settings;
      this.isLoading = false;

      if (that.showSeparateCCCField() || that.showExpenseTypeField()) {
        that.columnsToDisplay.push('ccc');
      }

      const data = {
        pageSize: that.storageService.get('mappings.pageSize') || 50,
        pageNumber: 0
      };
      that.reset(data);
    });
  }
}
