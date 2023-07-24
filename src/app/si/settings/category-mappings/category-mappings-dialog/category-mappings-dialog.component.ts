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
import { CategoryMapping } from 'src/app/core/models/category-mapping.model';

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
        return control.value && control.value.id && option && option.id === control.value.id;
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

    const sourceId = that.form.controls.fyleCategory.value.id;
    const destinationAccountId = that.form.controls.sageIntacctAccount.value ? that.form.controls.sageIntacctAccount.value.id : null;
    const destinationExpenseHeadId = that.form.controls.sageIntacctExpenseTypes.value ? that.form.controls.sageIntacctExpenseTypes.value.id : null;

    if (that.form.valid && (destinationAccountId || destinationExpenseHeadId)) {
      that.isLoading = true;

      const categoryMappingsPayload: CategoryMapping = {
        source_category: {
          id: sourceId
        },
        destination_account: {
          id: destinationAccountId
        },
        destination_expense_head: {
          id: destinationExpenseHeadId
        },
        workspace: that.workSpaceId
      };

      that.mappingsService.postCategoryMappings(categoryMappingsPayload).subscribe(() => {
        that.snackBar.open('Category Mapping saved successfully');
        that.isLoading = false;
        that.dialogRef.close();
      }, () => {
        that.isLoading = false;
        that.snackBar.open('Error saving Category Mapping');
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
  }

  getAttributesFilteredByConfig() {
    const that = this;
    const attributes = [];

    if (that.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT') {
      attributes.push('EXPENSE_TYPE');
    }

    if (that.configuration.reimbursable_expenses_object !== 'EXPENSE_REPORT' || that.configuration.corporate_credit_card_expenses_object !== 'EXPENSE_REPORT') {
      attributes.push('ACCOUNT');
    }
    return attributes;
  }


  reset() {
    const that = this;
    const attributes = that.getAttributesFilteredByConfig();

    that.isLoading = true;

    forkJoin([
      that.mappingsService.getFyleExpenseAttributes('CATEGORY', true),
      that.mappingsService.getGroupedSageIntacctDestinationAttributes(attributes, '', true)

    ]).subscribe(response => {
      that.isLoading = false;

      that.fyleCategories = response[0];
      that.sageIntacctAccounts = response[1].ACCOUNT;
      that.sageIntacctExpenseTypes = response[1].EXPENSE_TYPE;

      const fyleCategory = that.editMapping ? that.fyleCategories.filter(category => category.value === that.data.categoryMappingRow.source_category.value)[0] : '';
      const sageIntacctAccount = that.editMapping ? that.sageIntacctAccounts.filter(siAccObj => that.data.categoryMappingRow.destination_account && siAccObj.value === that.data.categoryMappingRow.destination_account.value)[0] : '';
      const sageIntacctExpenseType = that.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT' && that.editMapping ? that.sageIntacctExpenseTypes.filter(siExpTypeObj => that.data.categoryMappingRow.destination_expense_head && siExpTypeObj.value === that.data.categoryMappingRow.destination_expense_head.value)[0] : '';

      that.form = that.formBuilder.group({
        fyleCategory: [fyleCategory, Validators.compose([Validators.required, that.forbiddenSelectionValidator(that.fyleCategories)])],
        sageIntacctAccount: [sageIntacctAccount],
        sageIntacctExpenseTypes: [sageIntacctExpenseType]
      });

      if (that.editMapping) {
        that.form.controls.fyleCategory.disable();
      }

      that.setupAutocompleteWatchers();
    });
  }


  ngOnInit() {
    const that = this;

    if (that.data.categoryMappingRow) {
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
