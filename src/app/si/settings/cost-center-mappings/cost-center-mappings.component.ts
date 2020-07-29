import { Component, OnInit } from '@angular/core';
import { MappingsService } from '../../../core/services/mappings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CostCenterMappingsDialogComponent } from './cost-center-mappings-dialog/cost-center-mappings-dialog.component';
import { SettingsService } from 'src/app/core/services/settings.service';

@Component({
  selector: 'app-cost-center-mappings',
  templateUrl: './cost-center-mappings.component.html',
  styleUrls: ['./cost-center-mappings.component.scss', '../settings.component.scss', '../../si.component.scss']
})
export class CostCenterMappingsComponent implements OnInit {
  isLoading = false;
  workspaceId: number;
  costCenterMappings: any[];
  generalSettings: any;
  isConfigValueSet = false;
  columnsToDisplay = ['costCenter', 'si'];

  constructor(private mappingsService: MappingsService, private router: Router, private route: ActivatedRoute, public dialog: MatDialog, private settingsService: SettingsService) { }

  open() {
    const that = this;
    const dialogRef = that.dialog.open(CostCenterMappingsDialogComponent, {
      width: '450px',
      data: {
        workspaceId: that.workspaceId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      that.getCostCenterMappings();
    });
  }


  getCostCenterMappings() {
    const that = this;
    that.isLoading = true;
    that.mappingsService.getMappings('COST_CENTER').subscribe(costCenterMappings => {
      that.costCenterMappings = costCenterMappings.results;
      that.isLoading = false;
    });
  }

  goToConfigurations() {
    this.router.navigate([`/workspaces/${this.workspaceId}/settings/configurations/`]);
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = +that.route.parent.snapshot.params.workspace_id;
    that.isLoading = true;
    that.settingsService.getCombinedSettings(that.workspaceId).subscribe((settings) => {
      that.isLoading = false;
      that.generalSettings = settings;
      that.isConfigValueSet = !!that.generalSettings.cost_center_field_mapping;
      if (that.isConfigValueSet) {
        that.getCostCenterMappings();
      }
    }, () => {
      that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
    });
  }
}
