import { Component, Input, OnInit, Directive } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, NgControl } from '@angular/forms';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { SkipExport } from 'src/app/core/models/skip-export.model';
import { forkJoin } from 'rxjs';
import { MatChipInputEvent } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ExpenseFilterResponse } from 'src/app/core/models/expense-filter-response.model';
import { ConditionField } from 'src/app/core/models/condition-field.model';

@Component({
  selector: 'app-skip-export',
  templateUrl: './skip-export.component.html',
  styleUrls: ['./skip-export.component.scss'],
})
export class SkipExportComponent implements OnInit {
  isLoading = true;
  tooltip = false;
  skippedCondition1: string;
  skippedCondition2: string;
  isDisabledChip1 = false;
  isDisabledChip2 = false;
  skipExportForm: FormGroup;
  showAdditionalCondition = false;
  showAddButton = true;
  workspaceId: number;
  conditionFieldOptions: Array<{
    field_name: string;
    type: string;
    is_custom: boolean;
  }>;
  valueFieldOptions1 = [];
  valueFieldOptions2 = [];
  operatorFieldOptions1: { label: string; value: string }[];
  operatorFieldOptions2: { label: string; value: string }[];
  joinByOptions = [{ value: 'AND' }, { value: 'OR' }];
  constructor(
    private mappingsService: MappingsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {}
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  customOperatorOptions = [
    {
      label: 'Is',
      value: 'iexact',
    },
    {
      label: 'Is empty',
      value: 'is_empty',
    },
    {
      label: 'Is not empty',
      value: 'is_not_empty',
    },
  ];
  customSelectOperatorOptions = [
    {
      label: 'Is',
      value: 'iexact',
    },
    {
      label: 'Is not',
      value: 'not_in'
    }
  ];
  valueOption1: any[] = [];
  valueOption2: any[] = [];
  separatorKeysCodes: number[] = [ENTER, COMMA];

  showTooltip() {
    this.tooltip = true;
  }

  hideTooltip() {
    this.tooltip = false;
  }

  add1(addEvent1: MatChipInputEvent): void {
    const input = addEvent1.input;
    const value = addEvent1.value;

    if ((value || '').trim()) {
      this.valueOption1.push(value);
    }

    if (input) {
      input.value = '';
    }
  }

  remove1(chipValue: any): void {
    const index = this.valueOption1.indexOf(chipValue);

    if (index >= 0) {
      this.valueOption1.splice(index, 1);
    }
  }

  add2(addEvent2: MatChipInputEvent): void {
    const input = addEvent2.input;
    const value = addEvent2.value;

    if ((value || '').trim()) {
      this.valueOption2.push(value);
    }

    if (input) {
      input.value = '';
    }
  }

  remove2(chipValue: any): void {
    const index = this.valueOption2.indexOf(chipValue);

    if (index >= 0) {
      this.valueOption2.splice(index, 1);
    }
  }

  resetOptions() {
    this.skipExportForm.controls.join_by.reset();
    this.skipExportForm.controls.condition2.reset();
    this.skipExportForm.controls.operator2.reset();
    this.skipExportForm.controls.value2.reset();
  }

  resetFields(operator, value, conditionSelected, rank: number) {
    operator.reset();
    value.reset();
    if (rank === 1) {
      this.valueOption1 = [];
    } else if (rank === 2) {
      this.valueOption2 = [];
    }
    if (conditionSelected !== null) {
      if (conditionSelected.is_custom === true) {
        this.setCustomOperatorOptions(rank, conditionSelected.type);
      } else if (conditionSelected.is_custom === false) {
        if (rank === 1) {
          this.operatorFieldOptions1 = this.setDefaultOperatorOptions(
            conditionSelected.field_name
          );
        } else if (rank === 2) {
          this.operatorFieldOptions2 = this.setDefaultOperatorOptions(
            conditionSelected.field_name
          );
        }
      }
    }
  }

  updateAdditionalFilterVisibility(show) {
    this.showAdditionalCondition = show;
    this.showAddButton = !show;
  }

  remCondition() {
    this.showAdditionalCondition = false;
    this.showAddButton = true;
    this.resetOptions();
  }

  checkValidationCondition() {
    if (
      this.skipExportForm.get('condition1').valid &&
      this.skipExportForm.get('condition2').valid
    ) {
      if (
        this.skipExportForm.get('condition1').value.field_name ===
        this.skipExportForm.get('condition2').value.field_name
      ) {
        return true;
      }
    }
    return false;
  }

  checkValidation() {
    if (this.showAdditionalCondition) {
      if (
        this.skipExportForm.get('condition1').valid &&
        this.skipExportForm.get('condition2').valid &&
        this.skipExportForm.get('join_by').valid
      ) {
        if (
          this.skipExportForm.get('condition1').value.field_name !==
          this.skipExportForm.get('condition2').value.field_name
        ) {
          if (
            (this.skipExportForm.get('condition1').value.field_name ===
              'spent_at' &&
              this.skipExportForm.get('value1').valid) || (this.skipExportForm.get('condition1').value.field_name === 'report_title' && this.skipExportForm.get('value1').valid) ||
            this.valueOption1.length !== 0 ||
            this.skipExportForm.get('operator1').value === 'is_empty' ||
            this.skipExportForm.get('operator1').value === 'is_not_empty'
          ) {
            if (
              (this.skipExportForm.get('condition2').value.field_name ===
                'spent_at' &&
                this.skipExportForm.get('value2').valid) || (this.skipExportForm.get('condition2').value.field_name === 'report_title' && this.skipExportForm.get('value2').valid) ||
              this.valueOption2.length !== 0 ||
              this.skipExportForm.get('operator2').value === 'is_empty' ||
              this.skipExportForm.get('operator2').value === 'is_not_empty'
            ) {
              return true;
            }
          }
        }
      }
    } else if (this.skipExportForm.get('condition1').valid && this.skipExportForm.get('operator1').valid) {
      if (this.valueOption1.length !== 0 || this.skipExportForm.get('value1').valid) {
        return true;
      }
      if (
        this.skipExportForm.get('condition1').value.field_name === 'spent_at' &&
        this.skipExportForm.get('value1').valid
      ) {
        return true;
      }
      if (
        this.skipExportForm.get('operator1').value === 'is_empty' ||
        this.skipExportForm.get('operator1').value === 'is_not_empty'
      ) {
        return true;
      }
    }
    return false;
  }

  saveSkipExportFields() {
    const that = this;
    that.isLoading = true;
    const valueField = this.skipExportForm.getRawValue();
    if (valueField.condition1.field_name !== 'report_title' && valueField.operator1 === 'iexact') {
      valueField.operator1 = 'in';
    }
    if (valueField.join_by) {
      if (valueField.condition2.field_name !== 'report_title' && valueField.operator2 === 'iexact') {
        valueField.operator2 = 'in';
      }
  }
    if (valueField.condition1.is_custom === true) {
      if (valueField.operator1 === 'is_empty') {
        valueField.value1 = ['True'];
        valueField.operator1 = 'isnull';
      } else if (valueField.operator1 === 'is_not_empty') {
        valueField.value1 = ['False'];
        valueField.operator1 = 'isnull';
      }
    }

    if (valueField.condition1.field_name === 'spent_at') {
      valueField.value1 = new Date(valueField.value1).toISOString().split('T')[0] + 'T17:00:00.000Z';
    }

    if (typeof valueField.value1 === 'string') {
      valueField.value1 = [valueField.value1];
    }
    const payload1 = {
      condition: valueField.condition1.field_name,
      operator: valueField.operator1,
      values:
        valueField.condition1.type === 'DATE' ||
        valueField.operator1 === 'isnull' || valueField.condition1.field_name === 'report_title'
          ? valueField.value1
          : this.valueOption1,
      rank: 1,
      join_by: valueField.join_by ? valueField.join_by : null,
      is_custom: valueField.condition1.is_custom,
      custom_field_type: valueField.condition1.is_custom
        ? valueField.condition1.type
        : null,
    };
    this.settingsService
      .postSkipExport(that.workspaceId, payload1)
      .subscribe((skipExport1: SkipExport) => {
        if (valueField.condition2 && valueField.operator2) {
          if (valueField.condition2.field_name === 'spent_at') {
            valueField.value2 = new Date(valueField.value2).toISOString().split('T')[0] + 'T17:00:00.000Z';
          }

          if (valueField.condition2.is_custom === true) {
            if (valueField.operator2 === 'is_empty') {
              valueField.value2 = ['True'];
              valueField.operator2 = 'isnull';
            } else if (valueField.operator2 === 'is_not_empty') {
              valueField.value2 = ['False'];
              valueField.operator2 = 'isnull';
            }
          }

          if (typeof valueField.value2 === 'string') {
            valueField.value2 = [valueField.value2];
          }
          const payload2 = {
            condition: valueField.condition2.field_name,
            operator: valueField.operator2,
            values:
              valueField.condition2.type === 'DATE' ||
              valueField.operator2 === 'isnull' || valueField.condition2.field_name === 'report_title'
                ? valueField.value2
                : this.valueOption2,
            rank: 2,
            join_by: null,
            is_custom: valueField.condition2.is_custom,
            custom_field_type: valueField.condition2.is_custom
              ? valueField.condition2.type
              : null,
          };
          this.settingsService
            .postSkipExport(that.workspaceId, payload2)
            .subscribe((skipExport2: SkipExport) => {});
        }
        that.isLoading = false;
        this.snackBar.open('Skip Export fields saved successfully');
      });
  }

  setDefaultOperatorOptions(conditionField: string) {
    const operatorList = [];
    if (
      conditionField === 'claim_number' ||
      conditionField === 'employee_email' ||
      conditionField === 'report_title'
    ) {
      operatorList.push({
        value: 'iexact',
        label: 'Is',
      });
    } else if (conditionField === 'spent_at') {
      operatorList.push({
        value: 'lt',
        label: 'Is before',
      });
      operatorList.push({
        value: 'lte',
        label: 'Is it on or before',
      });
    }
    if (conditionField === 'report_title') {
      operatorList.push({
        value: 'icontains',
        label: 'contains',
      });
    }
    return operatorList;
  }

  setCustomOperatorOptions(rank: number, type: string) {
      if (type !== 'SELECT') {
        if (rank === 1) {
          this.operatorFieldOptions1 = this.customOperatorOptions;
        } else if (rank === 2) {
          this.operatorFieldOptions2 = this.customOperatorOptions;
        }
      } else {
        if (rank === 1) {
          this.operatorFieldOptions1 = this.customSelectOperatorOptions;
        } else if (rank === 2) {
          this.operatorFieldOptions2 = this.customSelectOperatorOptions;
        }
      }
    }

  conditionFieldWatcher() {
    this.skipExportForm.controls.condition1.valueChanges.subscribe(
      (conditionSelected) => {
        this.resetFields(
          this.skipExportForm.controls.operator1,
          this.skipExportForm.controls.value1,
          conditionSelected,
          1
        );
      }
    );

    this.skipExportForm.controls.condition2.valueChanges.subscribe(
      (conditionSelected) => {
        this.resetFields(
          this.skipExportForm.controls.operator2,
          this.skipExportForm.controls.value2,
          conditionSelected,
          2
        );
      }
    );
  }

  operatorFieldWatcher() {
    this.skipExportForm.controls.operator1.valueChanges.subscribe(
      (operatorSelected) => {
        this.valueOption1 = [];
        if (
          operatorSelected === 'is_empty' ||
          operatorSelected === 'is_not_empty'
        ) {
          this.isDisabledChip1 = true;
        } else {
          this.isDisabledChip1 = false;
        }
      }
    );

    this.skipExportForm.controls.operator2.valueChanges.subscribe(
      (operatorSelected) => {
        this.valueOption2 = [];
        if (
          operatorSelected === 'is_empty' ||
          operatorSelected === 'is_not_empty'
        ) {
          this.isDisabledChip2 = true;
        } else {
          this.isDisabledChip2 = false;
        }
      }
    );
  }

  fieldWatcher() {
    this.conditionFieldWatcher();
    this.operatorFieldWatcher();
  }

  getCustomConditions() {
    this.mappingsService
      .getFyleCustomFields()
      .toPromise()
      .then((conditionValue) => {
        this.conditionFieldOptions = conditionValue;
      });
  }

  compareObjects(selectedOption: any, listedOption: any): boolean {
    if (JSON.stringify(selectedOption) === JSON.stringify(listedOption)) {
      return true;
    }
    return false;
  }

  private setConditionFields(response: ExpenseFilterResponse, conditionArray: ConditionField[]) {
    response.results.forEach((element) => {
      const type = this.conditionFieldOptions.filter( (fieldOption) => fieldOption.field_name === element.condition);
      const selectedConditionOption : ConditionField = type[0];
      conditionArray.push(selectedConditionOption);
    });
  }

  private setOperatorFieldOptions(response: ExpenseFilterResponse, conditionArray: ConditionField[]) {
    if (conditionArray.length) {
      if (response.results[0].is_custom) {
        this.setCustomOperatorOptions(response.results[0].rank, response.results[0].custom_field_type);
      } else {
        this.operatorFieldOptions1 = this.setDefaultOperatorOptions(response.results[0].condition);
      }
      if (response.results[0].join_by !== null) {
        if (response.results[1].is_custom) {
          this.setCustomOperatorOptions(response.results[1].rank, response.results[1].custom_field_type);
        } else {
          this.operatorFieldOptions2 = this.setDefaultOperatorOptions(response.results[1].condition);
        }
      }
    }
  }

  private setSkippedConditions(response: ExpenseFilterResponse, conditionArray: ConditionField[]) {
    if (response.count > 0) {
      this.skippedCondition1 = conditionArray[0].field_name;
      if (response.count > 1 && response.results[0].join_by) {
        this.skippedCondition2 = conditionArray[1].field_name;
      } else {
        this.skippedCondition2 = '';
      }
    } else {
      this.skippedCondition1 = '';
      this.skippedCondition2 = '';
    }
  }

  getSelectedOperator(operator: string, value: any, condition: ConditionField) {
    switch (operator) {
      case 'isnull': {
        return value === 'True' ? 'is_empty' : 'is_not_empty';
      }
      case 'in':
        return 'iexact';
      case 'iexact': return operator;
      default: return operator;
    }
  }

  getFieldValue(value: any, condition: ConditionField, rank: number) {
    if (condition.type === 'DATE') {
      return new Date(value[0]);
    } else if (condition.field_name === 'report_title') {
      return value[0];
    }
      if (rank === 1) {
        this.valueOption1 = value;
      } else if (rank === 2) {
        this.valueOption2 = value;
      }
        return '';

  }

  setupSkipExportForm(response: ExpenseFilterResponse, conditionArray: ConditionField[]) {

    this.setConditionFields(response, conditionArray);

    this.setOperatorFieldOptions(response, conditionArray);

    this.setSkippedConditions(response, conditionArray);

    let [selectedOperator1, valueFC1, customFieldTypeFC1] = ['', '', ''];
    let [selectedOperator2, valueFC2] = ['', ''];
    let joinByFC = '';

    response.results.forEach((result, index) => {
      if (index === 0) {
        selectedOperator1 = this.getSelectedOperator(result.operator, result.values[0], conditionArray[0]);
        if (!(selectedOperator1 === 'is_empty' || selectedOperator1 === 'is_not_empty')) {
          valueFC1 = this.getFieldValue(result.values, conditionArray[0], result.rank);
        } else {
          this.isDisabledChip1 = true;
        }
        customFieldTypeFC1 = result.custom_field_type;
      } else if (index === 1 && response.results[0].join_by !== null) {
        selectedOperator2 = this.getSelectedOperator(result.operator, result.values[0], conditionArray[1]);
        joinByFC = response.results[0].join_by;
        if (!(selectedOperator2 === 'is_empty' || selectedOperator2 === 'is_not_empty')) {
          valueFC2 = this.getFieldValue(result.values, conditionArray[1], result.rank);
        } else {
          this.isDisabledChip2 = true;
        }
      }
    });

    this.skipExportForm = this.formBuilder.group({
      condition1: [conditionArray.length > 0 ? conditionArray[0] : ''],
      operator1: [selectedOperator1],
      value1: [valueFC1],
      customFieldType1: [customFieldTypeFC1],
      join_by: [joinByFC],
      condition2: [joinByFC ? conditionArray[1] : ''],
      operator2: [joinByFC && selectedOperator2 ? selectedOperator2 : ''],
      value2: [valueFC2],
      customFieldType2: joinByFC ? [response.results[1].custom_field_type] : ['']
    });
    this.fieldWatcher();
    this.isLoading = false;
  }

  getAllSettings() {
    forkJoin([
      this.mappingsService.getFyleCustomFields(),
      this.settingsService.getSkipExport(this.workspaceId),
    ]).subscribe((responses) => {
      this.conditionFieldOptions = responses[0];
      this.setupSkipExportForm(responses[1], []);
    });
  }

  ngOnInit() {
    this.workspaceId = this.route.snapshot.parent.parent.params.workspace_id;
    this.getAllSettings();
  }
}
