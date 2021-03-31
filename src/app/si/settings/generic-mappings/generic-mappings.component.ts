import { Component, OnInit } from '@angular/core';
import { MappingsService } from '../../../core/services/mappings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/core/services/storage.service';
import { GenericMappingsDialogComponent } from './generic-mappings-dialog/generic-mappings-dialog.component';
import { SettingsService } from 'src/app/core/services/settings.service';
import { Mapping } from 'src/app/core/models/mappings.model';
import { GeneralSetting } from 'src/app/core/models/general-setting.model';
import { MappingSetting } from 'src/app/core/models/mapping-setting.model';
import { MappingRow } from 'src/app/core/models/mapping-row.model';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-generic-mappings',
  templateUrl: './generic-mappings.component.html',
  styleUrls: ['./generic-mappings.component.scss', '../settings.component.scss', '../../si.component.scss']
})
export class GenericMappingsComponent implements OnInit {
  workspaceId: number;
  sourceField: string;
  isLoading: boolean;
  mappings: MatTableDataSource<Mapping> = new MatTableDataSource([]);
  generalSettings: GeneralSetting;
  setting: MappingSetting;
  count: number;
  pageNumber: number;
  rowElement: Mapping;
  columnsToDisplay = ['sourceField', 'destinationField'];

  constructor(private mappingsService: MappingsService, private router: Router, private route: ActivatedRoute, public dialog: MatDialog, private storageService: StorageService, private settingsService: SettingsService) { }

  open(selectedItem: MappingRow = null) {
    const that = this;
    const dialogRef = that.dialog.open(GenericMappingsDialogComponent, {
      width: '450px',
      data: {
        workspaceId: that.workspaceId,
        setting: that.setting,
        rowElement: selectedItem
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const data = {
        pageSize: that.storageService.get('mappings.pageSize') || 50,
        pageNumber: 0
      };
      that.getMappings(data);
      const onboarded = that.storageService.get('onboarded');

      if (onboarded === false) {
        that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
      }
    });
  }

  applyFilter(event: Event) {
    const that = this;
    const filterValue = (event.target as HTMLInputElement).value;
    that.mappings.filter = filterValue.trim().toLowerCase();
  }

  getTitle(name: string) {
    return name.replace(/_/g, ' ');
  }

  getMappings(data) {
    const that = this;
    that.mappingsService.getMappings(that.setting.source_field, null, data.pageSize, data.pageSize * data.pageNumber).subscribe(mappings => {
      that.mappings = new MatTableDataSource(mappings.results);
      that.count = mappings.count;
      that.mappings.filterPredicate = that.searchByText;
      that.isLoading = false;
      that.pageNumber = data.pageNumber;
    });
  }

  goToConfigurations() {
    this.router.navigate([`/workspaces/${this.workspaceId}/settings/configurations/general/`]);
  }

  searchByText(data: Mapping, filterText: string) {
    return data.source.value.toLowerCase().includes(filterText) ||
    data.destination.value.toLowerCase().includes(filterText);
  }

  ngOnInit() {
    const that = this;
    that.route.params.subscribe(val => {
      that.isLoading = true;
      that.workspaceId = +that.route.parent.snapshot.params.workspace_id;
      that.sourceField = that.route.snapshot.params.source_field;
      that.settingsService.getMappingSettings(that.workspaceId).subscribe(response => {
        that.setting = response.results.filter(setting => setting.source_field === that.sourceField.toUpperCase())[0];
        const data = {
          pageSize: that.storageService.get('mappings.pageSize') || 50,
          pageNumber: 0
        };
        that.getMappings(data);
      });
    });

  }

}
