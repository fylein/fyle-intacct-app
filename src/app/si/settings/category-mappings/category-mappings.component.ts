import { Component, OnInit } from '@angular/core';
import { MappingsService } from '../../../core/services/mappings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CategoryMappingsDialogComponent } from './category-mappings-dialog/category-mappings-dialog.component';
import { StorageService } from 'src/app/core/services/storage.service';
import { SettingsService } from 'src/app/core/services/settings.service';
import { forkJoin, from } from 'rxjs';

@Component({
  selector: 'app-category-mappings',
  templateUrl: './category-mappings.component.html',
  styleUrls: ['./category-mappings.component.scss', '../settings.component.scss', '../../si.component.scss']
})
export class CategoryMappingsComponent implements OnInit {
  isLoading = false;
  workspaceId: number;
  categoryMappings: any[];
  columnsToDisplay = ['category', 'sageIntacct'];

  constructor(
    private mappingsService: MappingsService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private router: Router,
    private storageService: StorageService,
    private settingsService: SettingsService) { }

  open() {
    const that = this;
    const dialogRef = that.dialog.open(CategoryMappingsDialogComponent, {
      width: '450px',
      data: {
        workspaceId: that.workspaceId
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
        sage_intacct_value: categoryMapping.destination.value,
        ccc_account: that.getCCCAccount(that.categoryMappings, categoryMapping)
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

    const getCategoryMappings = that.mappingsService.getMappings('CATEGORY').toPromise().then(categoryMappings => {
      that.categoryMappings = categoryMappings.results;
      that.createCategoryMappingsRows();
    });

    const showOrHideCCCField = that.settingsService.getCombinedSettings(that.workspaceId).toPromise().then(settings => {
      if (settings.corporate_credit_card_expenses_object && settings.reimbursable_expenses_object === 'EXPENSE_REPORT') {
        that.columnsToDisplay = ['category', 'sageIntacct', 'ccc'];
      }
    });

    that.isLoading = true;
    forkJoin([
      from(getCategoryMappings),
      from(showOrHideCCCField),
    ]).subscribe(() => {
      that.isLoading = false;
    }, (err) => {
      that.isLoading = false;
    })
  }


  ngOnInit() {
    const that = this;
    that.workspaceId = that.route.parent.snapshot.params.workspace_id;
    that.reset();
  }

}
