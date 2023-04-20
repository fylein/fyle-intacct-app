import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm, ValidatorFn, AbstractControl } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { MappingSource } from 'src/app/core/models/mapping-source.model';
import { MappingDestination } from 'src/app/core/models/mapping-destination.model';
import { Configuration } from 'src/app/core/models/configuration.model';
import { GeneralMapping } from 'src/app/core/models/general-mapping.model';
import { MappingModal } from 'src/app/core/models/mapping-modal.model';
import { EmployeeMapping } from 'src/app/core/models/employee-mapping.model';

export class MappingErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-employee-mappings-dialog',
  templateUrl: './employee-mappings-dialog.component.html',
  styleUrls: ['./employee-mappings-dialog.component.scss', '../../settings.component.scss']
})
export class EmployeeMappingsDialogComponent implements OnInit {
  isLoading = false;
  form: FormGroup;
  workSpaceId: number;
  fyleEmployees: MappingSource[];
  employeeOptions: MappingSource[];
  sageIntacctEmployees: MappingDestination[];
  creditCardValue: MappingDestination[];
  sageIntacctVendors: MappingDestination[];
  sageIntacctEmployeeOptions: MappingDestination[];
  cccOptions: MappingDestination[];
  sageIntacctVendorOptions: MappingDestination[];
  configuration: Configuration;
  generalMappings: GeneralMapping;
  defaultCCCObj: MappingDestination;
  editMapping: boolean;

  matcher = new MappingErrorStateMatcher();

  constructor(private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<EmployeeMappingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: MappingModal,
              private mappingsService: MappingsService,
              private snackBar: MatSnackBar,
              private settingsService: SettingsService) { }


  mappingDisplay(mappingObject) {
    return mappingObject ? mappingObject.value : '';
  }

  submit() {
    const that = this;
    const fyleEmployee = that.form.getRawValue().fyleEmployee;
    const sageIntacctVendor = that.form.getRawValue().sageIntacctVendor;
    const sageIntacctEmployee = that.form.getRawValue().sageIntacctEmployee;

    if (that.form.valid && (sageIntacctVendor || sageIntacctEmployee)) {
      const employeeMapping: EmployeeMapping = {
        source_employee: {
          id: fyleEmployee.id
        },
        destination_vendor: {
          id: sageIntacctVendor ? sageIntacctVendor.id : null
        },
        destination_employee: {
          id: sageIntacctEmployee ? sageIntacctEmployee.id : null
        },
        destination_card_account: {
          id: null
        },
        workspace: that.workSpaceId
      };

      that.isLoading = true;
      that.mappingsService.postEmployeeMappings(employeeMapping).subscribe(() => {
        that.snackBar.open('Employee Mapping saved successfully');
        that.isLoading = false;
        that.dialogRef.close();
      }, err => {
        that.snackBar.open('Something went wrong');
        that.isLoading = false;
      });
    } else {
      that.snackBar.open('Form has invalid fields');
      that.form.markAllAsTouched();
    }
  }

  forbiddenSelectionValidator(options: (MappingSource|MappingDestination)[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: object } | null => {
      if (control.value) {
        const forbidden = !options.some((option) => {
          return control.value && control.value.id && option && option.id === control.value.id;
        });
        return forbidden ? {
          forbiddenOption: {
            value: control.value
          }
        } : null;
      }

      return null;
    };
  }

  setupFyleEmployeeAutocompleteWatcher() {
    const that = this;
    that.form.controls.fyleEmployee.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.employeeOptions = that.fyleEmployees
          .filter(fyleEmployee => new RegExp(newValue.toLowerCase(), 'g').test(fyleEmployee.value.toLowerCase()));
      }
    });
  }

  setupSageIntacctVendorAutocompleteWatcher() {
    const that = this;

    that.form.controls.sageIntacctVendor.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.sageIntacctVendorOptions = that.sageIntacctVendors
          .filter(sageIntacctVendor => new RegExp(newValue.toLowerCase(), 'g').test(sageIntacctVendor.value.toLowerCase()));
      }
    });
  }

  setupSageIntacctEmployeesWatcher() {
    const that = this;

    that.form.controls.sageIntacctEmployee.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.sageIntacctEmployeeOptions = that.sageIntacctEmployees
          .filter(sageIntacctEmployee => new RegExp(newValue.toLowerCase(), 'g').test(sageIntacctEmployee.value.toLowerCase()));
      }
    });
  }

  setupAutocompleteWatchers() {
    const that = this;
    that.setupFyleEmployeeAutocompleteWatcher();
    that.setupSageIntacctVendorAutocompleteWatcher();
    that.setupSageIntacctEmployeesWatcher();
  }

  getAttributesFilteredByConfig() {
    const that = this;
    const attributes = [];

    if (that.configuration.reimbursable_expenses_object === 'BILL') {
      attributes.push('VENDOR');
    } else if (that.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT') {
      attributes.push('EMPLOYEE');
    }

    return attributes;

  }

  reset() {
    const that = this;
    that.isLoading = true;

    const attributes = that.getAttributesFilteredByConfig();

    forkJoin([
      that.mappingsService.getFyleExpenseAttributes('EMPLOYEE'),
      that.mappingsService.getGroupedSageIntacctDestinationAttributes(attributes),
      that.mappingsService.getGeneralMappings()
    ]).subscribe(response => {
      that.isLoading = false;
      const settings = that.configuration;

      that.fyleEmployees = response[0];
      that.sageIntacctEmployees = response[1].EMPLOYEE;
      that.sageIntacctVendors = response[1].VENDOR;
      if (settings.corporate_credit_card_expenses_object === 'BILL') {
        that.creditCardValue = response[1].VENDOR;
      }
      that.generalMappings = response[2];

      const fyleEmployee = that.editMapping ? that.fyleEmployees.filter(employee => employee.value === that.data.employeeMappingRow.source_employee.value)[0] : '';
      const sageIntacctVendor = that.editMapping ? that.sageIntacctVendors.filter(vendor => that.data.employeeMappingRow.destination_vendor && vendor.value === that.data.employeeMappingRow.destination_vendor.value)[0] : '';
      const sageIntacctEmployee = that.editMapping ? that.sageIntacctEmployees.filter(employee => that.data.employeeMappingRow.destination_employee && employee.value === that.data.employeeMappingRow.destination_employee.value)[0] : '';

      that.form = that.formBuilder.group({
        fyleEmployee: [fyleEmployee, Validators.compose([Validators.required, that.forbiddenSelectionValidator(that.fyleEmployees)])],
        sageIntacctVendor: [sageIntacctVendor, that.configuration.reimbursable_expenses_object === 'BILL' ? that.forbiddenSelectionValidator(that.sageIntacctVendors) : null],
        sageIntacctEmployee: [sageIntacctEmployee, that.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT' ? that.forbiddenSelectionValidator(that.sageIntacctEmployees) : null],
      });

      if (that.editMapping) {
        that.form.controls.fyleEmployee.disable();
      }

      that.setupAutocompleteWatchers();
    });
  }

  ngOnInit() {
    const that = this;

    if (that.data.employeeMappingRow) {
      that.editMapping = true;
    }

    that.workSpaceId = that.data.workspaceId;
    that.isLoading = true;
    that.settingsService.getConfiguration(that.workSpaceId).subscribe(settings => {
      that.configuration = settings;
      that.isLoading = false;
      that.reset();
    });
  }

}
