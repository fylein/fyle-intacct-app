import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss', '../../si.component.scss']
})
export class ConfigurationComponent implements OnInit {

  isLoading: boolean;
  isSaveDisabled: boolean;
  generalSettingsForm: FormGroup;
  expenseOptions: { label: string, value: string }[];
  categoryOptions: { label: string, value: string }[];
  workspaceId: number;
  generalSettings: any;
  mappingSettings: any;
  employeeFieldMapping: any;
  reimburExpenseFieldMapping: any;
  categoryFieldMapping: any;
  projectFieldMapping: any;
  costCenterFieldMapping: any;

  constructor(private formBuilder: FormBuilder, private settingsService: SettingsService, private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar) { }

  getExpenseOptions(employeeMappedTo) {
    return {
      EMPLOYEE: [
        {
          label: 'Expense Report',
          value: 'EXPENSE_REPORT'
        }
      ],
      VENDOR: [
        {
          label: 'Bill',
          value: 'BILL'
        },
      ]
    }[employeeMappedTo];
  }

  getCategoryOptions(employeeMappedTo) {
    return {
      EMPLOYEE: [
        {
          label: 'Expense Types',
          value: 'EXPENSE_TYPE'
        }
      ],
      VENDOR: [
        {
          label: 'Gl Account Number',
          value: 'ACCOUNT'
        }
      ]
    }[employeeMappedTo];
  }

  configurationProjectCostCenterValidator: ValidatorFn = (fg: FormGroup) => {
    const project = fg.get('projects').value;
    const costCenter = fg.get('costCenters').value;
    if (!project || !costCenter) {
      return null;
    }

    return project === costCenter ? { projectCostCenterSame: true } : null;
  }

  getAllSettings() {
    const that = this;
    that.isLoading = true;
    forkJoin(
      [
        that.settingsService.getGeneralSettings(that.workspaceId),
        that.settingsService.getMappingSettings(that.workspaceId)
      ]
    ).subscribe(responses => {
      that.generalSettings = responses[0];
      that.mappingSettings = responses[1].results;

      const employeeFieldMapping = that.mappingSettings.filter(
        setting => (setting.source_field === 'EMPLOYEE') &&
          (setting.destination_field === 'EMPLOYEE' || setting.destination_field === 'VENDOR')
      )[0];

      const reimburExpenseFieldMapping = that.mappingSettings.filter(
        setting => (setting.source_field === 'EXPENSE_REPORT') &&
          (setting.destination_field === 'EXPENSE_REPORT' || setting.destination_field === 'BILL')
      )[0];

      const categoryFieldMapping = that.mappingSettings.filter(
        setting => (setting.source_field === 'CATEGORY') && 
        (setting.destination_field === 'EXPENSE_TYPE' || setting.destination_field === 'ACCOUNT')
      )[0];

      const projectFieldMapping = that.mappingSettings.filter(
        settings => settings.source_field === 'PROJECT'
      )[0];

      const costCenterFieldMapping = that.mappingSettings.filter(
        settings => settings.source_field === 'COST_CENTER'
      )[0];

      that.employeeFieldMapping = employeeFieldMapping;
      that.reimburExpenseFieldMapping = reimburExpenseFieldMapping;
      that.categoryFieldMapping = categoryFieldMapping;
      that.projectFieldMapping = projectFieldMapping ? projectFieldMapping : {};
      that.costCenterFieldMapping = costCenterFieldMapping ? costCenterFieldMapping : {};

      that.expenseOptions = that.getExpenseOptions(that.employeeFieldMapping.destination_field);
      that.categoryOptions = that.getCategoryOptions(that.employeeFieldMapping.destination_field);

      that.generalSettingsForm = that.formBuilder.group({
        employees: [that.employeeFieldMapping ? that.employeeFieldMapping.destination_field : ''],
        reimburExpense: [that.reimburExpenseFieldMapping ? that.reimburExpenseFieldMapping.destination_field : ''],
        category: [that.categoryFieldMapping ? that.categoryFieldMapping.destination_field : ''],
        projects: [that.projectFieldMapping ? that.projectFieldMapping.destination_field : ''],
        costCenters: [that.costCenterFieldMapping ? that.costCenterFieldMapping.destination_field : '']
      }, {
        validators: [that.configurationProjectCostCenterValidator]
      });

      if (that.generalSettings.employee_field_mapping) {
        that.expenseOptions = [        {
          label: 'Expense Report',
          value: 'EXPENSE_REPORT'
        },
        {
          label: 'Bill',
          value: 'BILL'
        }
        ];
      }

      that.generalSettingsForm.controls.employees.disable();
      that.generalSettingsForm.controls.reimburExpense.disable();
      that.generalSettingsForm.controls.category.disable()

      if (projectFieldMapping) {
        that.generalSettingsForm.controls.projects.disable();
      }

      if (costCenterFieldMapping) {
        that.generalSettingsForm.controls.costCenters.disable();
      }

      that.isLoading = false;
    }, error => {
      that.generalSettings = {};
      that.mappingSettings = {};
      that.isLoading = false;
      that.generalSettingsForm = that.formBuilder.group({
        employees: ['', Validators.required],
        reimburExpense: ['', Validators.required],
        category: ['', Validators.required],
        projects: [null],
        costCenters: [null],
      }, {
        validators: [that.configurationProjectCostCenterValidator]
      });

      that.generalSettingsForm.controls.employees.valueChanges.subscribe((employeeMappedTo) => {
        that.expenseOptions = that.getExpenseOptions(employeeMappedTo);
        that.categoryOptions = that.getCategoryOptions(employeeMappedTo);
        that.generalSettingsForm.controls.reimburExpense.reset();
        that.generalSettingsForm.controls.category.reset()
      });
    });
  }

  save() {
    const that = this;
    if (that.generalSettingsForm.valid) {
      const reimbursableExpensesObject = that.generalSettingsForm.value.reimburExpense || (that.reimburExpenseFieldMapping && that.reimburExpenseFieldMapping.destination_field);
      const categoryMappingObject = that.generalSettingsForm.value.category || (that.categoryFieldMapping && that.categoryFieldMapping.destination_field);
      const employeeMappingsObject = that.generalSettingsForm.value.employees || (that.employeeFieldMapping && that.employeeFieldMapping.destination_field);
      const projectMappingObject = that.generalSettingsForm.value.projects || (that.projectFieldMapping && that.projectFieldMapping.destination_field);
      const costCenterMappingObject = that.generalSettingsForm.value.costCenters || (that.costCenterFieldMapping && that.costCenterFieldMapping.destination_field);

      const mappingsSettingsPayload = [{
        source_field: 'EMPLOYEE',
        destination_field: employeeMappingsObject
      }];

      mappingsSettingsPayload.push({
        source_field: 'EXPENSE_REPORT',
        destination_field: reimbursableExpensesObject
      });

      mappingsSettingsPayload.push({
        source_field: 'CATEGORY',
        destination_field: categoryMappingObject
      });

      if (projectMappingObject) {
        mappingsSettingsPayload.push({
          source_field: 'PROJECT',
          destination_field: projectMappingObject
        });
      }

      if (costCenterMappingObject) {
        mappingsSettingsPayload.push({
          source_field: 'COST_CENTER',
          destination_field: costCenterMappingObject
        });
      }

      that.isLoading = true;

      forkJoin(
        [
          that.settingsService.postMappingSettings(that.workspaceId, mappingsSettingsPayload),
          that.settingsService.postGeneralSettings(that.workspaceId, reimbursableExpensesObject)
        ]
      ).subscribe(responses => {
        that.isLoading = true;
        that.snackBar.open('Configuration saved successfully');
        that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
      });
    } else {
      that.snackBar.open('Form has invalid fields');
      that.generalSettingsForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    const that = this;
    that.isSaveDisabled = false;
    that.workspaceId = that.route.snapshot.parent.params.workspace_id;
    that.getAllSettings();
  }

}
