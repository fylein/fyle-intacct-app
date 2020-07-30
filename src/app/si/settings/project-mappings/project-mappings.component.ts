import { Component, OnInit } from '@angular/core';
import { MappingsService } from '../../../core/services/mappings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProjectMappingsDialogComponent } from './project-mappings-dialog/project-mappings-dialog.component';
import { SettingsService } from 'src/app/core/services/settings.service';

@Component({
  selector: 'app-project-mappings',
  templateUrl: './project-mappings.component.html',
  styleUrls: ['./project-mappings.component.scss', '../settings.component.scss', '../../si.component.scss']
})
export class ProjectMappingsComponent implements OnInit {
  isLoading = false;
  workspaceId: number;
  projectMappings: any[];
  generalSettings: any;
  isConfigValueSet = false;
  columnsToDisplay = ['projects', 'si'];

  constructor(
    private mappingsService: MappingsService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private settingsService: SettingsService) { }

  open() {
    const that = this;
    const dialogRef = that.dialog.open(ProjectMappingsDialogComponent, {
      width: '450px',
      data: {
        workspaceId: that.workspaceId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      that.getCategoryMappings();
    });
  }

  getCategoryMappings() {
    const that = this;
    that.isLoading = true;
    that.mappingsService.getMappings('PROJECT').subscribe(projectMappings => {
      that.projectMappings = projectMappings.results;
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
    that.settingsService.getCombinedSettings(that.workspaceId).subscribe(settings => {
      that.generalSettings = settings;
      that.isLoading = false;
      that.isConfigValueSet = !!that.generalSettings.project_field_mapping;
      if (that.isConfigValueSet) {
        that.getCategoryMappings();
      }
    });
  }

}
