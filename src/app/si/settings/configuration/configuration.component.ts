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
  cccExpenseOptions: { label: string, value: string }[];
  workspaceId: number;
  generalSettings: any;
  mappingSettings: any;
  reimburExpenseFieldMapping: any;
  projectFieldMapping: any;
  costCenterFieldMapping: any;

  constructor(private formBuilder: FormBuilder, private settingsService: SettingsService, private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar) { }

  getEmployee(reimburExpenseMappedTo) {
    return {
      EXPENSE_REPORT: [
        {
          value: 'EMPLOYEE'
        }
      ],
      BILL: [
        {
          value: 'VENDOR'
        },
      ]
    }[reimburExpenseMappedTo];
  }

  getCategory(reimburExpenseMappedTo) {
    return {
      EXPENSE_REPORT: [
        {
          value: 'EXPENSE_TYPE'
        }
      ],
      BILL: [
        {
          value: 'ACCOUNT'
        }
      ]
    }[reimburExpenseMappedTo];
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

      const reimburExpenseFieldMapping = that.mappingSettings.filter(
        setting => (setting.source_field === 'EXPENSE_REPORT') &&
          (setting.destination_field === 'EXPENSE_REPORT' || setting.destination_field === 'BILL')
      )[0];

      const projectFieldMapping = that.mappingSettings.filter(
        settings => settings.source_field === 'PROJECT'
      )[0];

      const costCenterFieldMapping = that.mappingSettings.filter(
        settings => settings.source_field === 'COST_CENTER'
      )[0];

      that.reimburExpenseFieldMapping = reimburExpenseFieldMapping ? reimburExpenseFieldMapping : {};
      that.projectFieldMapping = projectFieldMapping ? projectFieldMapping : {};
      that.costCenterFieldMapping = costCenterFieldMapping ? costCenterFieldMapping : {};

      that.expenseOptions = [{
        label: 'Expense Report',
        value: 'EXPENSE_REPORT'
      },
      {
        label: 'Bill',
        value: 'BILL'
      }];

      that.cccExpenseOptions = [{
        label: 'Charge Card Transaction',
        value: 'CHARGE_CARD_TRANSACTION'
      },
      {
        label: 'Bill',
        value: 'BILL'
      }];

      that.generalSettingsForm = that.formBuilder.group({
        reimburExpense: [that.reimburExpenseFieldMapping ? that.reimburExpenseFieldMapping.destination_field : ''],
        cccExpense: [that.generalSettings ? that.generalSettings.corporate_credit_card_expenses_object : ''],
        projects: [that.projectFieldMapping ? that.projectFieldMapping.destination_field : ''],
        costCenters: [that.costCenterFieldMapping ? that.costCenterFieldMapping.destination_field : '']
      }, {
        validators: [that.configurationProjectCostCenterValidator]
      });

      that.generalSettingsForm.controls.reimburExpense.disable();

      if (that.generalSettings.corporate_credit_card_expenses_object) {
        that.generalSettingsForm.controls.cccExpense.disable();
      }

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
        reimburExpense: ['', Validators.required],
        cccExpense: [null],
        projects: [null],
        costCenters: [null],
      }, {
        validators: [that.configurationProjectCostCenterValidator]
      });

      that.expenseOptions = [{
        label: 'Expense Report',
        value: 'EXPENSE_REPORT'
      },
      {
        label: 'Bill',
        value: 'BILL'
      }];

      that.cccExpenseOptions = [{
        label: 'Charge Card Transaction',
        value: 'CHARGE_CARD_TRANSACTION'
      },
      {
        label: 'Bill',
        value: 'BILL'
      }];
    });
  }

  save() {
    const that = this;
    if (that.generalSettingsForm.valid) {
      const reimbursableExpensesObject = that.generalSettingsForm.value.reimburExpense || (that.reimburExpenseFieldMapping && that.reimburExpenseFieldMapping.destination_field);
      const cccExpensesObject = that.generalSettingsForm.value.cccExpense || that.generalSettings.corporate_credit_card_expenses_object || null;
      const categoryMappingObject = that.getCategory(reimbursableExpensesObject)[0].value;
      const employeeMappingsObject = that.getEmployee(reimbursableExpensesObject)[0].value;
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

      if (cccExpensesObject) {
        mappingsSettingsPayload.push({
          source_field: 'EMPLOYEE',
          destination_field: 'CHARGE_CARD_ACCOUNT'
        });

        mappingsSettingsPayload.push({
          source_field: 'CATEGORY',
          destination_field: 'CCC_ACCOUNT'
        });
      }

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
          that.settingsService.postGeneralSettings(that.workspaceId, reimbursableExpensesObject, cccExpensesObject)
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
