import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SettingsService } from 'src/app/core/services/settings.service';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { forkJoin, from } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class MappingErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-category-mappings-dialog',
  templateUrl: './category-mappings-dialog.component.html',
  styleUrls: ['./category-mappings-dialog.component.scss', '../../settings.component.scss']
})
export class CategoryMappingsDialogComponent implements OnInit {
  isLoading = false;
  form: FormGroup;
  workSpaceId: number;
  fyleCategories: any[];
  sageIntacctAccounts: any[];
  sageIntacctCCCAccounts: any[];
  sageIntacctExpenseTypes: any[];
  fyleCategoryOptions: any[];
  sageIntacctAccountOptions: any[];
  sageIntacctCCCAccountOptions: any[];
  sageIntacctExpenseTypeOptions: any[];
  generalSettings: any;
  matcher = new MappingErrorStateMatcher();

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CategoryMappingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mappingsService: MappingsService,
    private snackBar: MatSnackBar,
    private settingsService: SettingsService
  ) { }

  mappingDisplay(mappingObject) {
    return mappingObject ? mappingObject.value : '';
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

  submit() {
    const that = this;

    const fyleCategory = that.form.value.fyleCategory;
    const sageIntacctAccount = that.generalSettings.category_field_mapping === 'ACCOUNT' ? that.form.value.sageIntacctAccount : '';
    const sageIntacctExpenseTypes = that.generalSettings.category_field_mapping === 'EXPENSE_TYPE' ? that.form.value.sageIntacctExpenseTypes : '';

    let sageIntacctCCCAccount;
    let mappings;

    const cccObj = that.generalSettings.corporate_credit_card_expenses_object;
    if (cccObj && cccObj !== 'EXPENSE_REPORT') {
      sageIntacctCCCAccount = that.form.value.sageIntacctCCCAccount.value || that.form.value.sageIntacctAccount.value;
    }

    if (sageIntacctAccount || sageIntacctExpenseTypes) {
      that.isLoading = true;
      mappings = [
        that.mappingsService.postMappings({
          source_type: 'CATEGORY',
          destination_type: that.generalSettings.category_field_mapping,
          source_value: fyleCategory.value,
          destination_value: that.generalSettings.category_field_mapping === 'ACCOUNT' ? sageIntacctAccount.value : sageIntacctExpenseTypes.value
        })
      ];

      if (sageIntacctCCCAccount) {
        mappings.push(
          that.mappingsService.postMappings({
            source_type: 'CATEGORY',
            destination_type: 'CCC_ACCOUNT',
            source_value: fyleCategory.value,
            destination_value: sageIntacctCCCAccount
          })
        );
      }

      forkJoin(mappings).subscribe(response => {
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

  setupFyleCateogryWatchers() {
    const that = this;
    that.form.controls.fyleCategory.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.fyleCategoryOptions = that.fyleCategories
          .filter(fyleCategory => new RegExp(newValue.toLowerCase(), 'g').test(fyleCategory.value.toLowerCase()));
      }
    });
  }

  setupSageIntacctAccountWatchers() {
    const that = this;

    that.form.controls.sageIntacctAccount.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.sageIntacctAccountOptions = that.sageIntacctAccounts
          .filter(sageIntacctAccount => new RegExp(newValue.toLowerCase(), 'g').test(sageIntacctAccount.value.toLowerCase()));
      }
    });
  }

  setupSageIntacctCCCAccountWatchers() {
    const that = this;

    that.form.controls.sageIntacctCCCAccount.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.sageIntacctCCCAccountOptions = that.sageIntacctCCCAccounts
          .filter(sageIntacctAccount => new RegExp(newValue.toLowerCase(), 'g').test(sageIntacctAccount.value.toLowerCase()));
      }
    });
  }

  setupSageIntacctExpenseTypeWatchers() {
    const that = this;

    that.form.controls.sageIntacctExpenseTypes.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.sageIntacctExpenseTypeOptions = that.sageIntacctExpenseTypes
          .filter(sageIntacctExpenseType => new RegExp(newValue.toLowerCase(), 'g').test(sageIntacctExpenseType.value.toLowerCase()));
      }
    });
  }

  setupAutocompleteWatchers() {
    const that = this;
    that.setupFyleCateogryWatchers();
    that.setupSageIntacctAccountWatchers();
    that.setupSageIntacctExpenseTypeWatchers();
    this.setupSageIntacctCCCAccountWatchers();
  }

  reset() {
    const that = this;
    // TODO: remove promises and do with rxjs observables
    const getFyleCategories = that.mappingsService.getFyleCategories().toPromise().then(fyleCategories => {
      that.fyleCategories = fyleCategories;
    });

    // TODO: remove promises and do with rxjs observables
    const getSageIntacctAcc = that.mappingsService.getSageIntacctAccounts().toPromise().then(sageIntacctAccounts => {
      that.sageIntacctAccounts = sageIntacctAccounts;
      if (that.generalSettings.corporate_credit_card_expenses_object && that.generalSettings.corporate_credit_card_expenses_object !== 'EXPENSE_REPORT') {
        that.sageIntacctCCCAccounts = sageIntacctAccounts;
      }
    });

    // TODO: remove promises and do with rxjs observables
    const getSageIntacctExpType = that.mappingsService.getSageIntacctExpensetypes().toPromise().then((sageIntacctExpenseTypes) => {
      that.sageIntacctExpenseTypes = sageIntacctExpenseTypes;
    });

    that.isLoading = true;
    forkJoin([
      from(getFyleCategories),
      from(getSageIntacctAcc),
      from(getSageIntacctExpType)
    ]).subscribe((res) => {
      that.isLoading = false;

      that.form = that.formBuilder.group({
        fyleCategory: ['', Validators.compose([Validators.required, that.forbiddenSelectionValidator(that.fyleCategories)])],
        sageIntacctAccount: ['', that.generalSettings.reimbursable_expenses_object === 'BILL' || (that.generalSettings.corporate_credit_card_expenses_object && that.generalSettings.corporate_credit_card_expenses_object === 'CHARGE_CARD_TRANSACTION') ? that.forbiddenSelectionValidator(that.sageIntacctAccounts) : null],
        sageIntacctExpenseTypes: ['', that.generalSettings.reimbursable_expenses_object === 'EXPENSE_REPORT' ? that.forbiddenSelectionValidator(that.sageIntacctExpenseTypes) : null],
        sageIntacctCCCAccount: ['', that.showSeparateCCCField() ? that.forbiddenSelectionValidator(that.sageIntacctCCCAccounts) : null],
      });

      that.setupAutocompleteWatchers();
    });
  }

  showSeparateCCCField() {
    const that = this;
    const settings = that.generalSettings;
    if (settings.corporate_credit_card_expenses_object && settings.reimbursable_expenses_object === 'EXPENSE_REPORT') {
      return true;
    }

    return false;
  }

  ngOnInit() {
    const that = this;

    that.workSpaceId = that.data.workspaceId;
    that.isLoading = true;
    that.settingsService.getCombinedSettings(that.workSpaceId).subscribe(settings => {
      that.generalSettings = settings;
      that.isLoading = false;
      that.reset();
    });
  }
}
