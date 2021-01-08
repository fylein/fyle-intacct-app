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
  // TODO: replace any with relevant models
  fyleEmployees: any[];
  sageIntacctEmployees: any[];
  creditCardValue: any[];
  sageIntacctVendors: any[];
  generalSettings: any;
  employeeOptions: any[];
  sageIntacctEmployeeOptions: any[];
  cccOptions: any[];
  sageIntacctVendorOptions: any[];
  generalMappings: any;
  defaultCCCObj: any;
  editMapping: boolean;

  matcher = new MappingErrorStateMatcher();

  constructor(private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<EmployeeMappingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
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

    if (that.form.valid && (sageIntacctVendor || sageIntacctEmployee)) {
      const employeeMapping = [
        that.mappingsService.postMappings({
          source_type: 'EMPLOYEE',
          destination_type: that.generalSettings.reimbursable_expenses_object === 'BILL' ? 'VENDOR' : 'EMPLOYEE',
          source_value: fyleEmployee.value,
          destination_value: that.generalSettings.reimbursable_expenses_object === 'BILL' ? sageIntacctVendor.value : sageIntacctEmployee.value
        })
      ];

      if (creditCardAccount) {
        employeeMapping.push(
          that.mappingsService.postMappings({
            source_type: 'EMPLOYEE',
            destination_type: 'CHARGE_CARD_NUMBER',
            source_value: fyleEmployee.value,
            destination_value: creditCardAccount
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

  forbiddenSelectionValidator(options: any[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
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
      that.defaultCCCObj = that.creditCardValue.filter(cccObj => cccObj.value === that.generalMappings.default_charge_card_name)[0];
    }
  }

  reset() {
    const that = this;

    const getFyleEmployees = that.mappingsService.getFyleEmployees().toPromise().then((fyleEmployees) => {
      that.fyleEmployees = fyleEmployees;
    });

    const settings = that.generalSettings;

    const getSageIntacctEmployee = that.mappingsService.getSageIntacctEmployees().toPromise().then((sageIntacctEmployees) => {
      that.sageIntacctEmployees = sageIntacctEmployees;
    });

    const getSageIntacctVendor = that.mappingsService.getSageIntacctVendors().toPromise().then((sageIntacctVendors) => {
      that.sageIntacctVendors = sageIntacctVendors;
      if (settings.corporate_credit_card_expenses_object === 'BILL') {
        that.creditCardValue = sageIntacctVendors;
      }
    });

    const getSageIntacctChargeCard = that.mappingsService.getSageIntacctChargeCard().toPromise().then((getSageIntacctChargeCards) => {
      if (settings.corporate_credit_card_expenses_object === 'CHARGE_CARD_TRANSACTION') {
        that.creditCardValue = getSageIntacctChargeCards;
      }
    });

    const getGeneralMappings = that.mappingsService.getGeneralMappings().toPromise().then((generalMappings) => {
      that.generalMappings = generalMappings;
    });

    that.isLoading = true;
    forkJoin([
      from(getFyleEmployees),
      from(getSageIntacctEmployee),
      from(getSageIntacctVendor),
      from(getSageIntacctChargeCard),
      from(getGeneralMappings)
    ]).subscribe((res) => {
      that.isLoading = false;
      that.getDefaultCCCObj();

      const fyleEmployee = that.editMapping ? that.fyleEmployees.filter(employee => employee.value === that.data.rowElement.fyle_value)[0] : '';
      const sageIntacctVendor = that.editMapping ? that.sageIntacctVendors.filter(vendor => vendor.value === that.data.rowElement.sage_intacct_value)[0] : '';
      const sageIntacctEmployee = that.editMapping ? that.sageIntacctEmployees.filter(employee => employee.value === that.data.rowElement.sage_intacct_value)[0] : '';

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
    that.settingsService.getCombinedSettings(that.workSpaceId).subscribe(settings => {
      that.generalSettings = settings;
      that.isLoading = false;
      that.reset();
    });
  }

}
