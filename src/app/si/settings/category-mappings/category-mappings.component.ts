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

@Component({
  selector: 'app-category-mappings',
  templateUrl: './category-mappings.component.html',
  styleUrls: ['./category-mappings.component.scss', '../settings.component.scss', '../../si.component.scss']
})
export class CategoryMappingsComponent implements OnInit {
  isLoading = false;
  workspaceId: number;
  categoryMappings: Mapping[];
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
        that.reset();
      } else {
        that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
      }
    });
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

    that.categoryMappings = mappings;
  }

  getCCCAccount(categoryMappings, categoryMapping) {
    const categMapping = categoryMappings.filter(mapping => mapping.destination_type === 'CCC_ACCOUNT' && mapping.source.value === categoryMapping.source.value);

    return categMapping.length ? categMapping[0].destination.value : null;
  }

  reset() {
    const that = this;
    that.isLoading = true;

    forkJoin([
      that.mappingsService.getAllMappings('CATEGORY'),
      that.settingsService.getGeneralSettings(that.workspaceId)
    ]).subscribe(response => {
      that.isLoading = false;

      that.categoryMappings = response[0];
      that.createCategoryMappingsRows();
      if (response[1].corporate_credit_card_expenses_object && response[1].reimbursable_expenses_object === 'EXPENSE_REPORT') {
        that.columnsToDisplay = ['category', 'sageIntacct', 'ccc'];
      }
    }, (err) => {
      that.isLoading = false;
    });
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = that.route.parent.snapshot.params.workspace_id;
    that.reset();
  }
}
