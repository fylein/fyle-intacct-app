import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm, ValidatorFn, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { filter } from 'rxjs/internal/operators/filter';
import { map } from 'rxjs/internal/operators/map';
import { ActivatedRoute } from '@angular/router';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin, from } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { MappingSource } from 'src/app/core/models/mapping-source.model';
import { MappingDestination } from 'src/app/core/models/mapping-destination.model';
import { GeneralSetting } from 'src/app/core/models/general-setting.model';
import { GeneralMapping } from 'src/app/core/models/general-mapping.model';
import { MappingModal } from 'src/app/core/models/mapping-modal.model';

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
  generalSettings: GeneralSetting;
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
    const fyleEmployee = that.form.controls.fyleEmployee.value;
    const sageIntacctVendor = that.generalSettings.reimbursable_expenses_object === 'BILL' ? that.form.value.sageIntacctVendor : '';
    const sageIntacctEmployee = that.generalSettings.reimbursable_expenses_object === 'EXPENSE_REPORT' ? that.form.value.sageIntacctEmployee : '';
    const creditCardAccount = that.form.value.creditCardAccount ? that.form.value.creditCardAccount.value : null;
    const creditCardAccountId = that.form.value.creditCardAccount ? that.form.value.creditCardAccount.destination_id : null;
    if (that.form.valid && (sageIntacctVendor || sageIntacctEmployee)) {
      const employeeMapping = [
      that.mappingsService.postMappings({
        source_type: 'EMPLOYEE',
        destination_type: that.generalSettings.reimbursable_expenses_object === 'BILL' ? 'VENDOR' : 'EMPLOYEE',
        source_value: fyleEmployee.value,
        destination_value: that.generalSettings.reimbursable_expenses_object === 'BILL' ? sageIntacctVendor.value : sageIntacctEmployee.value,
        destination_id: that.generalSettings.reimbursable_expenses_object === 'BILL' ? sageIntacctVendor.destination_id : sageIntacctEmployee.destination_id
      })
    ];

      if (creditCardAccount) {
        employeeMapping.push(
          that.mappingsService.postMappings({
            source_type: 'EMPLOYEE',
            destination_type: 'CHARGE_CARD_NUMBER',
            source_value: fyleEmployee.value,
            destination_value: creditCardAccount,
            destination_id: creditCardAccountId
          })
        );
      }

      that.isLoading = true;
      forkJoin(employeeMapping).subscribe(responses => {
        that.snackBar.open('Mapping saved successfully');
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
      const forbidden = !options.some((option) => {
        return control.value.id && option.id === control.value.id;
      });
      return forbidden ? {
        forbiddenOption: {
          value: control.value
        }
      } : null;
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

  setupCCCAutocompleteWatcher() {
    const that = this;

    that.form.controls.creditCardAccount.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.cccOptions = that.creditCardValue
          .filter(cccObject => new RegExp(newValue.toLowerCase(), 'g').test(cccObject.value.toLowerCase()));
      }
    });
  }

  setupAutocompleteWatchers() {
    const that = this;
    that.setupFyleEmployeeAutocompleteWatcher();
    that.setupSageIntacctVendorAutocompleteWatcher();
    that.setupSageIntacctEmployeesWatcher();
    that.setupCCCAutocompleteWatcher();
  }

  getDefaultCCCObj() {
    const that = this;
    if (that.generalSettings.corporate_credit_card_expenses_object === 'CHARGE_CARD_TRANSACTION') {
      that.defaultCCCObj =  that.editMapping ? that.creditCardValue.filter(cccObj => cccObj.value === that.data.rowElement.ccc_value)[0] : that.creditCardValue.filter(cccObj => cccObj.value === that.generalMappings.default_charge_card_name)[0];
    }
  }

  reset() {
    const that = this;
    that.isLoading = true;

    forkJoin([
      that.mappingsService.getFyleExpenseCustomFields('EMPLOYEE'),
      that.mappingsService.getSageIntacctExpenseCustomFields('EMPLOYEE'),
      that.mappingsService.getSageIntacctExpenseCustomFields('VENDOR'),
      that.mappingsService.getSageIntacctExpenseCustomFields('CHARGE_CARD_NUMBER'),
      that.mappingsService.getGeneralMappings()
    ]).subscribe(response => {
      that.isLoading = false;
      const settings = that.generalSettings;

      that.fyleEmployees = response[0];
      that.sageIntacctEmployees = response[1];
      that.sageIntacctVendors = response[2];
      if (settings.corporate_credit_card_expenses_object === 'BILL') {
        that.creditCardValue = response[2];
      } else if (settings.corporate_credit_card_expenses_object === 'CHARGE_CARD_TRANSACTION') {
        that.creditCardValue = response[3];
      }
      that.generalMappings = response[4];

      that.getDefaultCCCObj();

      const fyleEmployee = that.editMapping ? that.fyleEmployees.filter(employee => employee.value === that.data.rowElement.fyle_value)[0] : '';
      const sageIntacctVendor = that.editMapping ? that.sageIntacctVendors.filter(vendor => vendor.value === that.data.rowElement.si_value)[0] : '';
      const sageIntacctEmployee = that.editMapping ? that.sageIntacctEmployees.filter(employee => employee.value === that.data.rowElement.si_value)[0] : '';

      that.form = that.formBuilder.group({
        fyleEmployee: [fyleEmployee, Validators.compose([Validators.required, that.forbiddenSelectionValidator(that.fyleEmployees)])],
        sageIntacctVendor: [sageIntacctVendor, that.generalSettings.reimbursable_expenses_object === 'BILL' ? that.forbiddenSelectionValidator(that.sageIntacctVendors) : null],
        sageIntacctEmployee: [sageIntacctEmployee, that.generalSettings.reimbursable_expenses_object === 'EXPENSE_REPORT' ? that.forbiddenSelectionValidator(that.sageIntacctEmployees) : null],
        creditCardAccount: [that.defaultCCCObj || '', (that.generalSettings.corporate_credit_card_expenses_object && that.generalSettings.corporate_credit_card_expenses_object === 'CHARGE_CARD_TRANSACTION') ? that.forbiddenSelectionValidator(that.creditCardValue) : null]
      });

      if (that.editMapping) {
        that.form.controls.fyleEmployee.disable();
      }

      that.setupAutocompleteWatchers();
    });
  }

  ngOnInit() {
    const that = this;

    if (that.data.rowElement) {
      that.editMapping = true;
    }

    that.workSpaceId = that.data.workspaceId;
    that.isLoading = true;
    that.settingsService.getGeneralSettings(that.workSpaceId).subscribe(settings => {
      that.generalSettings = settings;
      that.isLoading = false;
      that.reset();
    });
  }

}
