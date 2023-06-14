import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from 'src/app/core/services/settings.service';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { WindowReferenceService } from 'src/app/core/services/window.service';
import { SiComponent } from 'src/app/si/si.component';
import { MappingSetting } from 'src/app/core/models/mapping-setting.model';
import { ExpenseField } from 'src/app/core/models/expense-field.model';
import { MatSnackBar } from '@angular/material';
import { MappingSettingResponse } from 'src/app/core/models/mapping-setting-response.model';
import { DependentField, DependentFieldPost } from 'src/app/core/models/dependent-fields.model';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-expense-field-configuration',
  templateUrl: './expense-field-configuration.component.html',
  styleUrls: ['./expense-field-configuration.component.scss', '../../../si.component.scss'],
})
export class ExpenseFieldConfigurationComponent implements OnInit {
  expenseFieldsForm: FormGroup;
  dependentExpenseFieldsForm: FormGroup;
  expenseFields: FormArray;
  customFieldForm: FormGroup;
  workspaceId: number;
  isLoading: boolean;
  mappingSettings: MappingSetting[];
  fyleExpenseFields: ExpenseField[];
  sageIntacctFields: ExpenseField[] = [];
  sageIntacctFormFieldList: ExpenseField[];
  windowReference: Window;
  showCustomFieldName: boolean;
  customFieldName  = 'Choose Fyle Expense field';
  isSystemField: boolean;
  showAddButton: boolean;
  isTaskImported: boolean;
  showDependentFieldMapping: boolean;
  dependentFields: DependentField;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private settingsService: SettingsService, private mappingsService: MappingsService, private snackBar: MatSnackBar, private si: SiComponent, private windowReferenceService: WindowReferenceService) {
    this.windowReference = this.windowReferenceService.nativeWindow;
  }

  createExpenseField(sourceField: string = '', destinationField: string = '', isCustom: boolean = false, importToFyle: boolean = false, parentField: string = '') {
    const that = this;
    const fieldName = 'parent_field';
    const formControllers = {
      source_field: [sourceField ? sourceField : '', [Validators.required, RxwebValidators.unique()]],
      destination_field: [destinationField ? destinationField : '', [Validators.required, RxwebValidators.unique()]],
      import_to_fyle: [importToFyle],
      is_custom: [isCustom]
    };

    const group = that.formBuilder.group(formControllers);

    if (sourceField && destinationField) {
      group.controls.source_field.disable();
      group.controls.destination_field.disable();
    }

    if (parentField) {
      group.controls.parent_field.disable();
    }

    return group;
  }

  showOrHideAddButton() {
    const that = this;

    if (that.expenseFieldsForm.controls.expenseFields.value.length === that.sageIntacctFields.length || that.showCustomFieldName) {
      return false;
    }
    return true;
  }

  addExpenseField() {
    const that = this;

    that.expenseFields = that.expenseFieldsForm.get('expenseFields') as FormArray;
    that.expenseFields.push(that.createExpenseField());
    that.showAddButton = that.showOrHideAddButton();
  }

  enableDependentFieldImports(payload?: DependentFieldPost) {
    this.isLoading = true;
    if (!payload) {
      payload = {
        is_import_enabled: this.dependentExpenseFieldsForm.value.import,
        cost_code_field_name: this.dependentExpenseFieldsForm.value.costCode,
        cost_type_field_name: this.dependentExpenseFieldsForm.value.costType,
        workspace: parseInt(this.workspaceId.toString())
      };
    }

    const createOrUpdateDependentField = this.dependentFields ? this.settingsService.patchDependentFields(this.workspaceId, payload) : this.settingsService.postDependentFields(this.workspaceId, payload);

    createOrUpdateDependentField.subscribe((response) => {
      this.isLoading = false;
      this.dependentFields = response;
      this.snackBar.open('Dependent fields will be imported in few minutes');
    });
  }

  saveExpenseFields() {
    const that = this;
    const savedExpenseFieldForm = that.expenseFieldsForm;

    if (savedExpenseFieldForm.valid) {
      that.isLoading = true;
      // getRawValue() would have values even if they are disabled
      const expenseFields = savedExpenseFieldForm.getRawValue().expenseFields;
      let hasCustomField = false;
      expenseFields.forEach(element => {
        if (element.source_field !== 'PROJECT' && element.source_field !== 'COST_CENTER' && !element.is_custom) {
          element.is_custom = true;
        }
        if (element.is_custom) {
          hasCustomField = true;
        }
      });

      that.settingsService.postMappingSettings(that.workspaceId, expenseFields).subscribe((mappingSetting: MappingSetting[]) => {
        that.si.refreshDashboardMappingSettings(mappingSetting);
        that.createFormFields(mappingSetting);
        that.getSettings();
        if (hasCustomField) {
          that.getFyleFields().then(() => {
            that.isLoading = false;
          });
        } else {
          that.isLoading = false;
        }
      }, (error) => {
        if (error.error && 'message' in error.error && error.error.message === 'Duplicate custom field name') {
          const fieldName = error.error.field_name.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
          that.snackBar.open(`${fieldName} already exists in Fyle, try creating a custom field with different name`,
          '', {
            duration: 5000
          });
        } else {
          that.snackBar.open('Something went wrong while saving expense fields mapping');
        }
        that.getSettings();
      });
    } else {
      that.snackBar.open('Please fill all mandatory fields');
    }
  }

  removeExpenseField(index: number, sourceField: string = null) {
    const that = this;
    that.showCustomFieldName = false;

    const expenseFields = that.expenseFieldsForm.get('expenseFields') as FormArray;
    expenseFields.removeAt(index);

    // remove custom field option from the Fyle fields drop down if the corresponding row is deleted
    if (sourceField && sourceField !== 'PROJECT' && sourceField !== 'COST_CENTER') {
      that.fyleExpenseFields = that.fyleExpenseFields.filter(mappingRow => mappingRow.attribute_type !== sourceField);
    }
    that.showAddButton = that.showOrHideAddButton();
  }

  showCustomField(expenseField) {
    const that = this;

    expenseField.controls.import_to_fyle.setValue(true);
    expenseField.controls.import_to_fyle.disable();
    expenseField.controls.source_field.disable();

    that.showCustomFieldName = true;
    that.customFieldForm.markAllAsTouched();
  }

  updateCustomFieldName(name: string) {
    const that = this;

    let existingFields: string[] = that.fyleExpenseFields.map(fields => fields.display_name.toLowerCase());
    const systemFields = ['employee id', 'organisation name', 'employee name', 'employee email', 'expense date', 'expense date', 'expense id', 'report id', 'employee id', 'department', 'state', 'reporter', 'report', 'purpose', 'vendor', 'category', 'category code', 'mileage distance', 'mileage unit', 'flight from city', 'flight to city', 'flight from date', 'flight to date', 'flight from class', 'flight to class', 'hotel checkin', 'hotel checkout', 'hotel location', 'hotel breakfast', 'currency', 'amount', 'foreign currency', 'foreign amount', 'tax', 'approver', 'project', 'billable', 'cost center', 'cost center code', 'approved on', 'reimbursable', 'receipts', 'paid date', 'expense created date'];
    existingFields = existingFields.concat(systemFields);

    if (existingFields.indexOf(name.toLowerCase()) !== -1) {
      that.isSystemField = true;
      return;
    }

    that.isSystemField = false;
    that.customFieldName = name;
  }

  hideCustomField(event: string) {
    const that = this;
    that.showCustomFieldName = false;

    const fieldForm = that.expenseFieldsForm;
    const customFieldNameForm = that.customFieldForm;
    let lastAddedMappingIndex;

    lastAddedMappingIndex = fieldForm.getRawValue().expenseFields.length - 1;

    const customFieldName = customFieldNameForm.value.customFieldName.replace(/ /g, '_').toUpperCase();
    const fyleExpenseFields = that.fyleExpenseFields;

    if (event === 'Done') {
      fyleExpenseFields.push({
        attribute_type: customFieldName,
        display_name: customFieldNameForm.value.customFieldName
      });

      const formValuesArray = fieldForm.get('expenseFields') as FormArray;
      formValuesArray.controls[lastAddedMappingIndex].get('source_field').setValue(customFieldName);
      formValuesArray.controls[lastAddedMappingIndex].get('is_custom').setValue(true);
      formValuesArray.controls[lastAddedMappingIndex].get('import_to_fyle').setValue(true);

    } else if (lastAddedMappingIndex) {
      that.removeExpenseField(lastAddedMappingIndex);
    }
    that.customFieldForm.controls.customFieldName.reset();
    that.customFieldName = 'Choose Fyle Expense field';
    that.showAddButton = that.showOrHideAddButton();
  }

  saveCustomField() {
    const that = this;

    that.showCustomFieldName = false;
    that.saveExpenseFields();
  }

  private setupDependentExpenseFieldsWatcher(): void {
    if (this.dependentExpenseFieldsForm.value.import) {
      this.dependentExpenseFieldsForm.controls.costCode.disable();
      this.dependentExpenseFieldsForm.controls.costType.disable();
    }

    // TODO: disable cost code and project code if it's already imported
    this.dependentExpenseFieldsForm.controls.import.valueChanges.subscribe((isToggleEnabled: boolean) => {
      if (isToggleEnabled) {
        this.dependentExpenseFieldsForm.controls.costCode.setValidators([Validators.required]);
        this.dependentExpenseFieldsForm.controls.costType.setValidators([Validators.required]);
      } else {
        if (this.dependentFields) {
          const payload: DependentFieldPost = {
            is_import_enabled: false,
            workspace: parseInt(this.workspaceId.toString())
          }
          this.enableDependentFieldImports(payload);
        }
        this.dependentExpenseFieldsForm.controls.costCode.clearValidators();
        this.dependentExpenseFieldsForm.controls.costType.clearValidators();
      }
    });
  }

  createFormFields(mappingSetting: MappingSetting[]) {
    const that = this;

    that.mappingSettings = mappingSetting.filter(
      setting => setting.source_field !== 'EMPLOYEE' && setting.source_field !== 'CATEGORY' && setting.source_field !== 'CORPORATE_CARD'
    );

    let expenseFieldFormArray;
    if (that.mappingSettings.length) {
      expenseFieldFormArray = that.mappingSettings.map(
        setting => that.createExpenseField(setting.source_field, setting.destination_field, setting.is_custom, setting.import_to_fyle)
      );
    } else {
      expenseFieldFormArray = [that.createExpenseField()];
    }

    that.expenseFieldsForm = that.formBuilder.group({
      expenseFields: that.formBuilder.array(expenseFieldFormArray)
    });

    that.dependentExpenseFieldsForm = that.formBuilder.group({
      import: [this.dependentFields ? this.dependentFields.is_import_enabled : false],
      costCode: [this.dependentFields ? new TitleCasePipe().transform(this.dependentFields.cost_code_field_name.replace(/_/g, ' ').toLowerCase()) : null],
      costType: [this.dependentFields ? new TitleCasePipe().transform(this.dependentFields.cost_type_field_name.replace(/_/g, ' ').toLowerCase()) : null],
      costCodeValue: ['Cost Code'],
      costTypeValue: ['Cost Type']
    });

    this.setupDependentExpenseFieldsWatcher();
  }

  getMappingSettings() {
    const that = this;
    return that.settingsService.getMappingSettings(that.workspaceId).toPromise().then((mappingSetting: MappingSettingResponse) => {
      that.createFormFields(mappingSetting.results);

      return mappingSetting;
    });
  }

  getFyleFields() {
    const that = this;

    return that.mappingsService.getFyleFields().toPromise().then((fyleFields: ExpenseField[]) => {
      that.fyleExpenseFields = fyleFields;

      return fyleFields;
    });
  }

  getSageIntacctFields() {
    const that = this;

    return that.mappingsService.getSageIntacctFields().toPromise().then((sageIntacctFields: ExpenseField[]) => {
      that.sageIntacctFields = sageIntacctFields;
      that.sageIntacctFormFieldList = sageIntacctFields;

      let isProjectImported = false;
      that.mappingSettings.filter(setting => {
        if (setting.destination_field === 'PROJECT' && setting.source_field === 'PROJECT' && setting.import_to_fyle) {
          isProjectImported = true;
        }
      });

      that.showDependentFieldMapping = isProjectImported ? true : false;

      return sageIntacctFields;
    });
  }

  private getDependentFields() {
    return this.settingsService.getDependentFields(this.workspaceId).toPromise().then((dependentFields: DependentField) => {
      this.dependentFields = dependentFields;

      return dependentFields;
    }).catch(() => {
      // do nothing
    });
  }

  getSettings() {
    const that = this;

    that.customFieldForm = that.formBuilder.group({
      customFieldName: ['', Validators.required]
    });

    that.getDependentFields()
    .then(() => {
      that.getMappingSettings()
      .then(() => {
        return that.getFyleFields();
      }).then(() => {
          return that.getSageIntacctFields();
        }).finally(() => {
          that.showAddButton = that.showOrHideAddButton();
          that.isLoading = false;
        });
    })
  }

  ngOnInit() {
    const that = this;

    that.isLoading = true;

    that.workspaceId = that.route.snapshot.parent.parent.params.workspace_id;

    that.getSettings();
  }
}
