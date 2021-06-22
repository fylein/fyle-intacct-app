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
  expenseFields: FormArray;
  customFieldForm: FormGroup;
  workspaceId: number;
  isLoading: boolean;
  mappingSettings: MappingSetting[];
  fyleExpenseFields: ExpenseField[];
  sageIntacctFields: ExpenseField[];
  sageIntacctFormFieldList: ExpenseField[];
  windowReference: Window;
  showCustomFieldName: boolean;
  customFieldName  = 'Choose Fyle Expense field';
  isSystemField: boolean;
  showAddButton: boolean;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private settingsService: SettingsService, private mappingsService: MappingsService, private snackBar: MatSnackBar, private si: SiComponent, private windowReferenceService: WindowReferenceService) {
    this.windowReference = this.windowReferenceService.nativeWindow;
  }

  createExpenseField(sourceField: string = '', destinationField: string = '', isCustom = false, importToFyle: boolean = false) {
    const that = this;
    const group = that.formBuilder.group({
      source_field: [sourceField ? sourceField : '', [Validators.required, RxwebValidators.unique()]],
      destination_field: [destinationField ? destinationField : '', [Validators.required, RxwebValidators.unique()]],
      import_to_fyle: [importToFyle],
      is_custom: [isCustom]
    });

    if (sourceField && destinationField) {
      group.controls.source_field.disable();
      group.controls.destination_field.disable();
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

  saveExpenseFields() {
    const that = this;

    if (that.expenseFieldsForm.valid) {
      that.isLoading = true;
      // getRawValue() would have values even if they are disabled
      const expenseFields = that.expenseFieldsForm.getRawValue().expenseFields;
      const hasCustomField = expenseFields.filter(expenseField => expenseField.is_custom);

      that.settingsService.postMappingSettings(that.workspaceId, expenseFields).subscribe((mappingSetting: MappingSetting[]) => {
        that.si.refreshDashboardMappingSettings(mappingSetting);
        that.createFormFields(mappingSetting);
        if (hasCustomField.length) {
          that.getFyleFields().then(() => {
            that.isLoading = false;
          });
        } else {
          that.isLoading = false;
        }
      }, () => that.snackBar.open('Something went wrong while saving expense fields mapping'));
    } else {
      that.snackBar.open('Please fill all mandatory fields');
    }
  }

  removeExpenseField(index: number, sourceField: string = null) {
    const that = this;

    const expenseFields = that.expenseFieldsForm.get('expenseFields') as FormArray;
    expenseFields.removeAt(index);

    // remove custom field option from the Fyle fields drop down if the corresponding row is deleted
    if (sourceField && sourceField !== 'PROJECT' && sourceField !== 'COST_CENTER') {
      that.fyleExpenseFields = that.fyleExpenseFields.filter(mappingRow => mappingRow.attribute_type !== sourceField)
    }
    that.showAddButton = that.showOrHideAddButton();
  }


  showCustomField() {
    const that = this;

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
    const lastAddedMappingIndex = that.expenseFieldsForm.getRawValue().expenseFields.length - 1;
    const customFieldName = that.customFieldForm.value.customFieldName.replace(/ /g, '_').toUpperCase();

    if (event === 'Done') {
      that.fyleExpenseFields.push({
        attribute_type: customFieldName,
        display_name: that.customFieldForm.value.customFieldName
      });

      const formValuesArray = <FormArray> that.expenseFieldsForm.get('expenseFields');
      formValuesArray.controls[lastAddedMappingIndex].get('source_field').setValue(customFieldName);
      formValuesArray.controls[lastAddedMappingIndex].get('is_custom').setValue(true);
      formValuesArray.controls[lastAddedMappingIndex].get('import_to_fyle').setValue(true);
    } else {
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

  createFormFields(mappingSetting: MappingSetting[]) {
    const that = this;

    that.mappingSettings = mappingSetting.filter(
      setting => setting.source_field !== 'EMPLOYEE' && setting.source_field !== 'CATEGORY'
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

    return that.mappingsService.getFyleExpenseFields().toPromise().then((fyleFields: ExpenseField[]) => {
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

  getSettings() {
    const that = this;

    that.customFieldForm = that.formBuilder.group({
      customFieldName: ['', Validators.required]
    });

    that.getMappingSettings()
      .then(() => {
        return that.getFyleFields();
      }).then(() => {
        return that.getSageIntacctFields();
      }).finally(() => {
        that.showAddButton = that.showOrHideAddButton();
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
