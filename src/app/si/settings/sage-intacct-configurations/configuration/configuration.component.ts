import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WindowReferenceService } from 'src/app/core/services/window.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss', '../../../si.component.scss']
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
  windowReference: Window;

  constructor(private formBuilder: FormBuilder,
              private settingsService: SettingsService,
              private route: ActivatedRoute,
              private router: Router,
              private snackBar: MatSnackBar,
              private windowReferenceService: WindowReferenceService) {
                this.windowReference = this.windowReferenceService.nativeWindow;
              }

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
        reimburExpense: [that.generalSettings ? that.generalSettings.reimbursable_expenses_object : ''],
        cccExpense: [that.generalSettings ? that.generalSettings.corporate_credit_card_expenses_object : ''],
        importProjects: [that.generalSettings.import_projects],
      });

      that.generalSettingsForm.controls.reimburExpense.disable();

      if (that.generalSettings.corporate_credit_card_expenses_object) {
        that.generalSettingsForm.controls.cccExpense.disable();
      }

      that.isLoading = false;
    }, error => {
      that.generalSettings = {};
      that.mappingSettings = {};
      that.isLoading = false;
      that.generalSettingsForm = that.formBuilder.group({
        reimburExpense: ['', Validators.required],
        cccExpense: [null],
        importProjects: [false]
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
      const reimbursableExpensesObject = that.generalSettingsForm.value.reimburExpense || that.generalSettings.reimbursable_expenses_object || null;
      const cccExpensesObject = that.generalSettingsForm.value.cccExpense || that.generalSettings.corporate_credit_card_expenses_object || null;
      const categoryMappingObject = that.getCategory(reimbursableExpensesObject)[0].value;
      const employeeMappingsObject = that.getEmployee(reimbursableExpensesObject)[0].value;
      const importProjects = that.generalSettingsForm.value.importProjects;

      const mappingsSettingsPayload = [{
        source_field: 'EMPLOYEE',
        destination_field: employeeMappingsObject
      }];

      mappingsSettingsPayload.push({
        source_field: 'CATEGORY',
        destination_field: categoryMappingObject
      });

      if (importProjects) {
        mappingsSettingsPayload.push({
          source_field: 'PROJECT',
          destination_field: 'PROJECT'
        });
      }

      if (cccExpensesObject) {
        mappingsSettingsPayload.push({
          source_field: 'EMPLOYEE',
          destination_field: 'CHARGE_CARD_NUMBER'
        });

        mappingsSettingsPayload.push({
          source_field: 'CATEGORY',
          destination_field: 'CCC_ACCOUNT'
        });
      }

      that.isLoading = true;

      forkJoin(
        [
          that.settingsService.postMappingSettings(that.workspaceId, mappingsSettingsPayload),
          that.settingsService.postGeneralSettings(that.workspaceId, reimbursableExpensesObject, cccExpensesObject, importProjects)
        ]
      ).subscribe(responses => {
        that.isLoading = true;
        that.snackBar.open('Configuration saved successfully');
        that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`).then(() => {
          that.windowReference.location.reload();
        });
        that.isLoading = false;
      });
    } else {
      that.snackBar.open('Form has invalid fields');
      that.generalSettingsForm.markAllAsTouched();
    }
  }

  ngOnInit() {
    const that = this;
    that.isSaveDisabled = false;
    that.workspaceId = that.route.snapshot.parent.parent.params.workspace_id;
    that.getAllSettings();
  }

}
