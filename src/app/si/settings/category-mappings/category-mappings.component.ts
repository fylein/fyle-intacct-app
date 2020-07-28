import { Component, OnInit } from '@angular/core';
import { MappingsService } from '../../../core/services/mappings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CategoryMappingsDialogComponent } from './category-mappings-dialog/category-mappings-dialog.component';
import { StorageService } from 'src/app/core/services/storage.service';

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
    private storageService: StorageService) { }

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
        that.getCategoryMappings();
      } else {
        that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
      }
    });
  }


  getCategoryMappings() {
    const that = this;
    that.isLoading = true;
    that.mappingsService.getMappings('CATEGORY').subscribe(categoryMappings => {
      that.categoryMappings = categoryMappings.results;
      that.isLoading = false;
    });
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = that.route.parent.snapshot.params.workspace_id;
    that.getCategoryMappings();
  }

}
