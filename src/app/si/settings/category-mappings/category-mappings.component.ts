import { Component, OnInit } from '@angular/core';
import { MappingsService } from '../../../core/services/mappings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CategoryMappingsDialogComponent } from './category-mappings-dialog/category-mappings-dialog.component';
import { StorageService } from 'src/app/core/services/storage.service';
import { SettingsService } from 'src/app/core/services/settings.service';
import { forkJoin, from } from 'rxjs';
import { GeneralSetting } from 'src/app/core/models/general-setting.model';
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
  pageNumber: number;
  generalSettings: GeneralSetting;
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
          pageSize: (that.storageService.get('mappings.pageSize') || 50) * (that.showCCCOption() ? 2 : 1),
          pageNumber: 0,
          tableDimension: that.showCCCOption() ? 3 : 2
        };
        that.reset(data);
      } else {
        that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
      }
    });
  }

  showCCCOption() {
    const that = this;

    return that.generalSettings.corporate_credit_card_expenses_object && that.generalSettings.corporate_credit_card_expenses_object !== 'EXPENSE_REPORT';
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
    that.mappingsService.getMappings('CATEGORY', null, data.pageSize, data.pageSize * data.pageNumber, data.tableDimension).subscribe(response => {
      that.isLoading = false;
      if (that.showCCCOption()) {
        that.columnsToDisplay = ['category', 'sageIntacct', 'ccc'];
      }
      that.categoryMappings = response.results;
      that.count = that.generalSettings.corporate_credit_card_expenses_object ?  response.count / 2 : response.count;
      that.pageNumber = data.pageNumber;
      that.createCategoryMappingsRows();

    }, (err) => {
      that.isLoading = false;
    });
  }

  ngOnInit() {
    const that = this;
    that.isLoading = true;
    that.workspaceId = that.route.parent.snapshot.params.workspace_id;
    that.settingsService.getGeneralSettings(this.workspaceId).subscribe(settings => {
      that.generalSettings = settings;
      this.isLoading = false;

      const data = {
        pageSize: (that.showCCCOption() ? 2 : 1) * (that.storageService.get('mappings.pageSize') || 50),
        pageNumber: 0,
        tableDimension: that.showCCCOption() ? 3 : 2
      };
      that.reset(data);
    });
  }
}
