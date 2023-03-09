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

@Component({
  selector: 'app-expense-field-configuration',
  templateUrl: './expense-field-configuration.component.html',
  styleUrls: ['./expense-field-configuration.component.scss', '../../../si.component.scss']
})
export class ExpenseFieldConfigurationComponent implements OnInit {
  expenseFieldsForm: FormGroup;
  dependentExpenseFieldsForm: FormGroup;
  dependentExpenseFields: FormArray;
  expenseFields: FormArray;
  customFieldForm: FormGroup;
  dependentCustomFieldForm: FormGroup;
  workspaceId: number;
  isLoading: boolean;
  mappingSettings: MappingSetting[];
  fyleExpenseFields: ExpenseField[];
  fyleDependentExpenseFields: ExpenseField[];
  sageIntacctFields: ExpenseField[];
  parentFields: ExpenseField[];
  sageIntacctFormFieldList: ExpenseField[];
  windowReference: Window;
  showCustomFieldName: boolean;
  customFieldName  = 'Choose Fyle Expense field';
  showDependentCustomFieldName: boolean;
  dependentCustomFieldName = 'Choose Dependent Custom Field'
  isSystemField: boolean;
  showAddButton: boolean;
  showDependentAddButton: boolean;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private settingsService: SettingsService, private mappingsService: MappingsService, private snackBar: MatSnackBar, private si: SiComponent, private windowReferenceService: WindowReferenceService) {
    this.windowReference = this.windowReferenceService.nativeWindow;
  }

  createExpenseField(sourceField: string = '', destinationField: string = '', isCustom = false, importToFyle: boolean = false) {
    const that = this;
    const group = that.formBuilder.group({
      source_field: [sourceField ? sourceField : '', [Validators.required, RxwebValidators.unique()]],
      destination_field: [destinationField ? destinationField : '', [Validators.required, RxwebValidators.unique()]],
      import_to_fyle: [importToFyle],
      is_custom: [isCustom],
    });

    if (sourceField && destinationField) {
      group.controls.source_field.disable();
      group.controls.destination_field.disable();
    }

    return group;
  }
  
  createDependentExpenseField(sourceField: string = '', destinationField: string = '', parentField: string = '', importToFyle: boolean = false) {
    const that = this;
    
    const group = that.formBuilder.group({
      source_field: [sourceField ? sourceField : '', [Validators.required, RxwebValidators.unique()]],
      destination_field: [destinationField ? destinationField : '', [Validators.required, RxwebValidators.unique()]],
      parent_field: [parentField ? parentField: '', [Validators.required, RxwebValidators.unique()]],      
      import_to_fyle: [importToFyle],

    })
    
    if (sourceField && destinationField && parentField) {
      group.controls.source_field.disable();
      group.controls.destination_field.disable();
      group.controls.parent_field.disable()
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
  
  showOrHideDependentAddButton() {
    const that = this;
    
    if (that.dependentExpenseFieldsForm.controls.dependentExpenseFields.value.length === Math.min(that.sageIntacctFields.length, that.parentFields.length) || that.showDependentCustomFieldName) {
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
  
  addDependentExpenseField() {
    const that = this;
    
    that.dependentExpenseFields  = that.dependentExpenseFieldsForm.get('dependentExpenseFields') as FormArray;
    that.dependentExpenseFields.push(that.createDependentExpenseField());

    that.showDependentAddButton = that.showOrHideDependentAddButton();
  }

  saveExpenseFields() {
    const that = this;

    if (that.dependentExpenseFieldsForm.valid) {
      that.isLoading = true;
      // getRawValue() would have values even if they are disabled
      const expenseFields = that.dependentExpenseFieldsForm.getRawValue().dependentExpenseFields;
      
      console.log('expense', that.expenseFields)

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
  
  removeDependentExpenseField(index: number, sourceField: string = null) {
    const that = this;
    
    that.showDependentCustomFieldName = false;
    const dependentExpenseFields = that.dependentExpenseFieldsForm.get('dependentExpenseFields') as FormArray;
    dependentExpenseFields.removeAt(index)
  
    if (sourceField && sourceField !== 'PROJECT' && sourceField !== 'COST_CENTER') {
      that.fyleDependentExpenseFields = that.fyleDependentExpenseFields.filter(mappingRow => mappingRow.attribute_type !== sourceField);
    }
    that.showDependentAddButton = that.showOrHideDependentAddButton();
    
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


  showDependentCustomField(dependentExpenseField) {
    const that = this;
    
    dependentExpenseField.controls.import_to_fyle.setValue(true);
    dependentExpenseField.controls.import_to_fyle.disable()
    dependentExpenseField.controls.source_field.disable()
    
    that.showDependentCustomFieldName = true;
    that.customFieldForm.markAllAsTouched()
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
  
  updateDependentCustomFieldName(name: string) {
    const that = this;
    
    let existingFields: string[] = that.fyleExpenseFields.map(fields => fields.display_name.toLowerCase());
    const systemFields = ['employee id', 'organisation name', 'employee name', 'employee email', 'expense date', 'expense date', 'expense id', 'report id', 'employee id', 'department', 'state', 'reporter', 'report', 'purpose', 'vendor', 'category', 'category code', 'mileage distance', 'mileage unit', 'flight from city', 'flight to city', 'flight from date', 'flight to date', 'flight from class', 'flight to class', 'hotel checkin', 'hotel checkout', 'hotel location', 'hotel breakfast', 'currency', 'amount', 'foreign currency', 'foreign amount', 'tax', 'approver', 'project', 'billable', 'cost center', 'cost center code', 'approved on', 'reimbursable', 'receipts', 'paid date', 'expense created date'];
    existingFields = existingFields.concat(systemFields);

    if (existingFields.indexOf(name.toLowerCase()) !== -1) {
      that.isSystemField = true;
      return;
    }

    that.isSystemField = false;
    that.dependentCustomFieldName = name;
  }

  hideCustomField(event: string) {
    const that = this;

    that.showCustomFieldName = false;
    const lastAddedMappingIndex = that.expenseFieldsForm.getRawValue().expenseFields.length - 1;
    const customFieldName = that.customFieldForm.value.customFieldName.replace(/ /g, '_').toUpperCase();

    if (event === 'Done') {
      that.fyleExpenseFields.push({
        attribute_type: customFieldName,
        display_name: that.customFieldForm.value.customFieldName
      });

      const formValuesArray = that.expenseFieldsForm.get('expenseFields') as FormArray;
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
  
  hideDependentCustomField(event: string) {
    const that = this;

    that.showDependentCustomFieldName = false;
    const lastAddedMappingIndex = that.dependentExpenseFieldsForm.getRawValue().dependentExpenseFields.length - 1;
    const dependentCustomFieldName = that.dependentCustomFieldForm.value.dependentCustomFieldName.replace(/ /g, '_').toUpperCase();

    if (event === 'Done') {
      that.fyleDependentExpenseFields.push({
        attribute_type: dependentCustomFieldName,
        display_name: that.dependentCustomFieldForm.value.dependentCustomFieldName
      });

      const formValuesArray = that.dependentExpenseFieldsForm.get('dependentExpenseFields') as FormArray;
      formValuesArray.controls[lastAddedMappingIndex].get('source_field').setValue(dependentCustomFieldName);
      formValuesArray.controls[lastAddedMappingIndex].get('import_to_fyle').setValue(true);

    } else if (lastAddedMappingIndex) {
      that.removeExpenseField(lastAddedMappingIndex);
    }

    that.dependentCustomFieldForm.controls.dependentCustomFieldName.reset();
    that.dependentCustomFieldName = 'Choose Fyle Dependent Expense field';
    that.showDependentAddButton = that.showOrHideDependentAddButton();
  }

  saveCustomField() {
    const that = this;

    that.showCustomFieldName = false;
    that.saveExpenseFields();
  }

  createFormFields(mappingSetting: MappingSetting[]) {
    const that = this;
    
    that.mappingSettings = mappingSetting.filter(
      setting => setting.source_field !== 'EMPLOYEE' && setting.source_field !== 'CATEGORY' && setting.expense_field === null
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
    
    
    let dependentSettings = mappingSetting.filter(setting => setting.expense_field !== null)
    let dependentExpenseFieldsFormArray;
    
    if (dependentSettings.length) {
      dependentExpenseFieldsFormArray = dependentSettings.map(
        setting => that.createDependentExpenseField(setting.source_field, setting.destination_field, setting.expense_field, setting.import_to_fyle)
      )
    } else {
      dependentExpenseFieldsFormArray = [that.createDependentExpenseField()]
    }

    that.dependentExpenseFieldsForm = that.formBuilder.group({
      dependentExpenseFields: that.formBuilder.array(dependentExpenseFieldsFormArray)
    })
    
    console.log(that.dependentExpenseFieldsForm)
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

      return sageIntacctFields;
    });
  }
  
  
  getExpenseField() {
    const that = this;
    return that.mappingsService.getParentFields().toPromise().then((parentFields: any) => {
      that.parentFields = parentFields['results'];
      
      that.fyleDependentExpenseFields = that.parentFields.filter((field) => {
        field['attribute_type'] !== 'PROJECT'
      });

      return parentFields;
    })
  }
  
  

  getSettings() {
    const that = this;

    that.customFieldForm = that.formBuilder.group({
      customFieldName: ['', Validators.required]
    });
    
    that.dependentCustomFieldForm = that.formBuilder.group({
      dependentCustomFieldName: ['', Validators.required]
    });

    that.getMappingSettings()
      .then(() => {
        return that.getFyleFields();
      }).then(() => {
        return that.getSageIntacctFields();
      }).then(()=> {
        return that.getExpenseField();
      }).finally(() => {
        that.showAddButton = that.showOrHideAddButton();
        that.showDependentAddButton = that.showOrHideDependentAddButton();
        that.isLoading = false;
      });
  }

  ngOnInit() {
    const that = this;

    that.isLoading = true;

    that.workspaceId = that.route.snapshot.parent.parent.params.workspace_id;

    that.getSettings();
  }
}
