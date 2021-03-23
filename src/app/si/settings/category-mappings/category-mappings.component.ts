import { Component, OnInit } from '@angular/core';
import { MappingsService } from '../../../core/services/mappings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CategoryMappingsDialogComponent } from './category-mappings-dialog/category-mappings-dialog.component';
import { StorageService } from 'src/app/core/services/storage.service';
import { SettingsService } from 'src/app/core/services/settings.service';
import { forkJoin, from } from 'rxjs';
import { Mapping } from 'src/app/core/models/mappings.model';
import { MappingRow } from 'src/app/core/models/mapping-row.model';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-category-mappings',
  templateUrl: './category-mappings.component.html',
  styleUrls: ['./category-mappings.component.scss', '../settings.component.scss', '../../si.component.scss']
})
export class CategoryMappingsComponent implements OnInit {
  isLoading = false;
  workspaceId: number;
  categoryMappings: Mapping[];
  categoryMappingRows: MatTableDataSource<MappingRow> = new MatTableDataSource([]);
  count: number;
  columnsToDisplay = ['category', 'sageIntacct'];

  constructor(
    private mappingsService: MappingsService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    private storageService: StorageService,
    private settingsService: SettingsService) { }

  open(selectedItem: MappingRow = null) {
    const that = this;
    const dialogRef = that.dialog.open(CategoryMappingsDialogComponent, {
      width: '450px',
      data: {
        workspaceId: that.workspaceId,
        rowElement: selectedItem
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const onboarded = that.storageService.get('onboarded');
      if (onboarded === true) {
        const data = {
          pageSize: (that.storageService.get('mappings.pageSize') || 50) * (that.columnsToDisplay.includes('ccc') ? 2 : 1),
          pageNumber: 0,
          tableDimension: that.columnsToDisplay.includes('ccc') ? 3 : 2
        };
        that.reset(data);
      } else {
        that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
      }
    });
  }

  applyFilter(event: Event) {
    const that = this;
    const filterValue = (event.target as HTMLInputElement).value;
    that.categoryMappingRows.filter = filterValue.trim().toLowerCase();
  }


  createCategoryMappingsRows() {
    const that = this;
    const categoryMappings = that.categoryMappings.filter(mapping => mapping.destination_type !== 'CCC_ACCOUNT');
    const mappings = [];
    categoryMappings.forEach(categoryMapping => {
      mappings.push({
        fyle_value: categoryMapping.source.value,
        si_value: categoryMapping.destination.value,
        auto_mapped: categoryMapping.source.auto_mapped,
        ccc_value: that.getCCCAccount(that.categoryMappings, categoryMapping)
      });
    });

    that.categoryMappingRows = new MatTableDataSource(mappings);
    that.categoryMappingRows.filterPredicate = that.searchByText;
  }

  getCCCAccount(categoryMappings, categoryMapping) {
    const categMapping = categoryMappings.filter(mapping => mapping.destination_type === 'CCC_ACCOUNT' && mapping.source.value === categoryMapping.source.value);

    return categMapping.length ? categMapping[0].destination.value : null;
  }

  searchByText(data: MappingRow, filterText: string) {
    return data.fyle_value.toLowerCase().includes(filterText) ||
    data.si_value.toLowerCase().includes(filterText) ||
    (data.ccc_value ? data.ccc_value.toLowerCase().includes(filterText) : false);
  }

  reset(data) {
    const that = this;
    that.isLoading = true;

    forkJoin([
      that.mappingsService.getMappings('CATEGORY', null, data.pageSize, data.pageSize * data.pageNumber, data.tableDimension),
      that.settingsService.getGeneralSettings(that.workspaceId)
    ]).subscribe(response => {
      that.isLoading = false;
      if (response[1].corporate_credit_card_expenses_object && response[1].reimbursable_expenses_object) {
        that.columnsToDisplay = ['category', 'sageIntacct', 'ccc'];
      }
      that.categoryMappings = response[0].results;
      that.count = that.columnsToDisplay.includes('ccc') ?  response[0].count / 2 : response[0].count;
      that.createCategoryMappingsRows();

    }, (err) => {
      that.isLoading = false;
    });
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = that.route.parent.snapshot.params.workspace_id;
    const data = {
      pageSize: (that.columnsToDisplay.includes('ccc') ? 2 : 1) * (that.storageService.get('mappings.pageSize') || 50),
      pageNumber: 0,
      tableDimension: that.columnsToDisplay.includes('ccc') ? 3 : 2
    };
    that.reset(data);
  }
}
