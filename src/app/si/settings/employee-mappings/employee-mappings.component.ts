import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MappingsService } from '../../../core/services/mappings.service';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeMappingsDialogComponent } from './employee-mappings-dialog/employee-mappings-dialog.component';
import { SettingsService } from 'src/app/core/services/settings.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { MatSnackBar, MatTableDataSource} from '@angular/material';
import { Mapping } from 'src/app/core/models/mappings.model';
import { GeneralSetting } from 'src/app/core/models/general-setting.model';
import { MappingRow } from 'src/app/core/models/mapping-row.model';


@Component({
  selector: 'app-employee-mappings',
  templateUrl: './employee-mappings.component.html',
  styleUrls: ['./employee-mappings.component.scss',  '../settings.component.scss', '../../si.component.scss']
})
export class EmployeeMappingsComponent implements OnInit {

  closeResult: string;
  form: FormGroup;
  employeeMappings: Mapping[];
  employeeMappingRows: MatTableDataSource<MappingRow> = new MatTableDataSource([]);
  workspaceId: number;
  isLoading = true;
  generalSettings: GeneralSetting;
  count: number;
  columnsToDisplay = ['employee_email', 'si'];

  constructor(public dialog: MatDialog,
              private route: ActivatedRoute,
              private mappingsService: MappingsService,
              private snackBar: MatSnackBar,
              private router: Router,
              private settingsService: SettingsService,
              private storageService: StorageService) {
  }

  open(selectedItem: MappingRow = null) {
    const that = this;
    const dialogRef = that.dialog.open(EmployeeMappingsDialogComponent, {
      width: '450px',
      data: {
        workspaceId: that.workspaceId,
        rowElement: selectedItem
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      that.isLoading = true;
      const tableDimension = that.columnsToDisplay.includes('ccc') ? 3 : 2;
      const pageSize = (that.storageService.get('mappings.pageSize') || 50) * (that.columnsToDisplay.includes('ccc') ? 2 : 1);
      that.mappingsService.getMappings('EMPLOYEE', null, pageSize, 0, tableDimension).subscribe((employees) => {
        that.count = that.columnsToDisplay.includes('ccc') ? employees.count / 2 : employees.count;
        that.employeeMappings = employees.results;
        that.isLoading = false;
        const onboarded = that.storageService.get('onboarded');

        if (onboarded) {
          that.createEmployeeMappingsRows();
        } else {
          that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
        }
      });
    });
  }

  applyFilter(event: Event) {
    const that = this;
    const filterValue = (event.target as HTMLInputElement).value;
    that.employeeMappingRows.filter = filterValue.trim().toLowerCase();
  }

  createEmployeeMappingsRows() {
    const that = this;
    const employeeEVMappings = that.employeeMappings.filter(mapping => mapping.destination_type !== 'CHARGE_CARD_NUMBER');
    const mappings = [];

    employeeEVMappings.forEach(employeeEVMapping => {
      mappings.push({
        fyle_value: employeeEVMapping.source.value,
        si_value: employeeEVMapping.destination.value,
        ccc_value: that.getCCCAccount(that.employeeMappings, employeeEVMapping),
        auto_mapped: employeeEVMapping.source.auto_mapped
      });
    });
    that.employeeMappingRows = new MatTableDataSource(mappings);
    that.employeeMappingRows.filterPredicate = that.searchByText;
  }

  getCCCAccount(employeeMappings, employeeEVMapping) {
    const empMapping = employeeMappings.filter(evMapping => evMapping.destination_type === 'CHARGE_CARD_NUMBER' && evMapping.source.value === employeeEVMapping.source.value);

    return empMapping.length ? empMapping[0].destination.value : null;
  }

  reset(data) {
    const that = this;
    that.isLoading = true;
    that.mappingsService.getMappings('EMPLOYEE', null, data.pageSize, data.pageNumber * data.pageSize, data.tableDimension).subscribe((employees) => {
      that.employeeMappings = employees.results;
      that.count = that.columnsToDisplay.includes('ccc') ? employees.count / 2 : employees.count;
      that.createEmployeeMappingsRows();
      that.isLoading = false;
    });
  }

  searchByText(data: MappingRow, filterText: string) {
    return data.fyle_value.toLowerCase().includes(filterText) ||
    data.si_value.toLowerCase().includes(filterText) ||
    (data.ccc_value ? data.ccc_value.toLowerCase().includes(filterText) : false);
  }

  triggerAutoMapEmployees() {
    const that = this;
    that.isLoading = true;
    that.mappingsService.triggerAutoMapEmployees().subscribe(() => {
      that.isLoading = false;
      that.snackBar.open('Auto mapping of employees may take up to 10 minutes');
    }, error => {
      that.isLoading = false;
      that.snackBar.open(error.error.message);
    });
  }

  ngOnInit() {
    const that = this;
    that.isLoading = true;
    that.workspaceId = +that.route.parent.snapshot.params.workspace_id;
    that.settingsService.getGeneralSettings(that.workspaceId).subscribe(settings => {
      that.generalSettings = settings;
      that.isLoading = false;
      if (that.generalSettings.corporate_credit_card_expenses_object !== 'BILL' && that.generalSettings.corporate_credit_card_expenses_object) {
        that.columnsToDisplay.push('ccc');
      }
      const data = {
        pageSize: (that.columnsToDisplay.includes('ccc') ? 2 : 1) * (that.storageService.get('mappings.pageSize') || 50),
        pageNumber: 0,
        tableDimension: that.columnsToDisplay.includes('ccc') ? 3 : 2
      };
      that.reset(data);
    });
  }
}
