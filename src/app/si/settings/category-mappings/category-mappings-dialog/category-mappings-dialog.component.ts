import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SettingsService } from 'src/app/core/services/settings.service';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorStateMatcher } from '@angular/material/core';
import { MappingSource } from 'src/app/core/models/mapping-source.model';
import { MappingDestination } from 'src/app/core/models/mapping-destination.model';
import { Configuration } from 'src/app/core/models/configuration.model';
import { MappingModal } from 'src/app/core/models/mapping-modal.model';

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
  fyleCategories: MappingSource[];
  fyleCategoryOptions: MappingSource[];
  sageIntacctAccounts: MappingDestination[];
  sageIntacctCCCAccounts: MappingDestination[];
  sageIntacctExpenseTypes: MappingDestination[];
  sageIntacctAccountOptions: MappingDestination[];
  sageIntacctCCCAccountOptions: MappingDestination[];
  sageIntacctExpenseTypeOptions: MappingDestination[];
  configuration: Configuration;
  editMapping: boolean;
  matcher = new MappingErrorStateMatcher();

  constructor(private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<CategoryMappingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: MappingModal,
              private mappingsService: MappingsService,
              private snackBar: MatSnackBar,
              private settingsService: SettingsService) { }

  mappingDisplay(mappingObject) {
    return mappingObject ? mappingObject.value : '';
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

  submit() {
    const that = this;

    const fyleCategory = that.form.controls.fyleCategory.value;
    const sageIntacctAccount = that.configuration.reimbursable_expenses_object === 'BILL' ? that.form.value.sageIntacctAccount : '';
    const sageIntacctExpenseTypes = that.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT' ? that.form.value.sageIntacctExpenseTypes : '';

    let sageIntacctCCCAccount;
    let mappings;

    const cccObj = that.configuration.corporate_credit_card_expenses_object;
    if (cccObj && cccObj !== 'EXPENSE_REPORT') {
      sageIntacctCCCAccount = that.form.controls.sageIntacctCCCAccount.value || that.form.controls.sageIntacctAccount.value;
    }

    if (that.form.valid && (sageIntacctAccount || sageIntacctExpenseTypes)) {
      that.isLoading = true;
      mappings = [
        that.mappingsService.postMappings({
          source_type: 'CATEGORY',
          destination_type: that.configuration.reimbursable_expenses_object === 'BILL' ? 'ACCOUNT' : 'EXPENSE_TYPE',
          source_value: fyleCategory.value,
          destination_value: that.configuration.reimbursable_expenses_object === 'BILL' ? sageIntacctAccount.value : sageIntacctExpenseTypes.value,
          destination_id: that.configuration.reimbursable_expenses_object === 'BILL' ? sageIntacctAccount.destination_id : sageIntacctExpenseTypes.destination_id
        })
      ];

      if (sageIntacctCCCAccount) {
        mappings.push(
          that.mappingsService.postMappings({
            source_type: 'CATEGORY',
            destination_type: 'CCC_ACCOUNT',
            source_value: fyleCategory.value,
            destination_value: sageIntacctCCCAccount.value,
            destination_id: sageIntacctCCCAccount.destination_id
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

  getAttributesFilteredByConfig() {
    const that = this;
    const attributes = [];

    if (that.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT') {
      attributes.push('EXPENSE_TYPE');
    } else if (that.configuration.reimbursable_expenses_object === 'BILL') {
      attributes.push('ACCOUNT')
    }

    if (that.showSeparateCCCField()) {
      attributes.push('CCC_ACCOUNT');
    }

    return attributes;
  }


  reset() {
    const that = this;
    const attributes = that.getAttributesFilteredByConfig();

    that.isLoading = true;

    forkJoin([
      that.mappingsService.getFyleExpenseAttributes('CATEGORY'),
      that.mappingsService.getGroupedSageIntacctDestinationAttributes(attributes)

    ]).subscribe(response => {
      that.isLoading = false;

      that.fyleCategories = response[0];
      that.sageIntacctAccounts = response[1].ACCOUNT;
      if (that.configuration.corporate_credit_card_expenses_object && that.configuration.corporate_credit_card_expenses_object !== 'EXPENSE_REPORT') {
        that.sageIntacctCCCAccounts = response[1].CCC_ACCOUNT;
      }
      that.sageIntacctExpenseTypes = response[1].EXPENSE_TYPE;

      const fyleCategory = that.editMapping ? that.fyleCategories.filter(category => category.value === that.data.rowElement.fyle_value)[0] : '';
      const sageIntacctAccount = that.configuration.reimbursable_expenses_object === 'BILL' && that.editMapping ? that.sageIntacctAccounts.filter(siAccObj => siAccObj.value === that.data.rowElement.si_value)[0] : '';
      const sageIntacctExpenseTypes = that.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT' && that.editMapping ? that.sageIntacctExpenseTypes.filter(siExpTypeObj => siExpTypeObj.value === that.data.rowElement.si_value)[0] : '';
      const sageIntacctCCCAccount = that.showSeparateCCCField() && that.editMapping ? that.sageIntacctCCCAccounts.filter(cccObj => cccObj.value === that.data.rowElement.ccc_value)[0] : '';

      that.form = that.formBuilder.group({
        fyleCategory: [fyleCategory, Validators.compose([Validators.required, that.forbiddenSelectionValidator(that.fyleCategories)])],
        sageIntacctAccount: [sageIntacctAccount, that.configuration.reimbursable_expenses_object === 'BILL' ? that.forbiddenSelectionValidator(that.sageIntacctAccounts) : null],
        sageIntacctExpenseTypes: [sageIntacctExpenseTypes, that.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT' ? that.forbiddenSelectionValidator(that.sageIntacctExpenseTypes) : null],
        sageIntacctCCCAccount: [sageIntacctCCCAccount, that.showSeparateCCCField() ? that.forbiddenSelectionValidator(that.sageIntacctCCCAccounts) : null],
      });

      if (that.editMapping) {
        that.form.controls.fyleCategory.disable();
      }

      that.setupAutocompleteWatchers();
    });
  }

  showSeparateCCCField() {
    const that = this;
    const settings = that.configuration;
    if (settings.corporate_credit_card_expenses_object && settings.corporate_credit_card_expenses_object !== 'EXPENSE_REPORT' && settings.reimbursable_expenses_object === 'EXPENSE_REPORT') {
      return true;
    }

    return false;
  }

  ngOnInit() {
    const that = this;

    if (that.data.rowElement) {
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
