import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WindowReferenceService } from 'src/app/core/services/window.service';
import { Configuration } from 'src/app/core/models/configuration.model';
import { SiComponent } from 'src/app/si/si.component';
import { MappingSetting } from 'src/app/core/models/mapping-setting.model';
import { MappingsService } from 'src/app/core/services/mappings.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss', '../../../si.component.scss']
})
export class ConfigurationComponent implements OnInit {

  isLoading: boolean;
  configurationForm: FormGroup;
  expenseOptions: { label: string, value: string }[];
  cccExpenseOptions: { label: string, value: string }[];
  workspaceId: number;
  configuration: Configuration;
  mappingSettings: MappingSetting[];
  showAutoCreate: boolean;
  windowReference: Window;

  constructor(private formBuilder: FormBuilder,
              private settingsService: SettingsService,
              private route: ActivatedRoute,
              private router: Router,
              private snackBar: MatSnackBar,
              private si: SiComponent,
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

  getCCCExpenseOptions(reimburExpenseMappedTo = null) {
    const cccExpenseOptions = [{
      label: 'Charge Card Transaction',
      value: 'CHARGE_CARD_TRANSACTION'
    },
    {
      label: 'Bill',
      value: 'BILL'
    },
    {
      label: 'Journal Entry',
      value: 'JOURNAL_ENTRY'
    },
  ];

    if (reimburExpenseMappedTo === 'EXPENSE_REPORT') {
      cccExpenseOptions.push({
        label: 'Expense Report',
        value: 'EXPENSE_REPORT'
      });
    }

    return cccExpenseOptions;
  }

  getAllSettings() {
    const that = this;

    forkJoin(
      [
        that.settingsService.getConfiguration(that.workspaceId),
        that.settingsService.getMappingSettings(that.workspaceId)
      ]
    ).subscribe(responses => {
      that.configuration = responses[0];
      that.mappingSettings = responses[1].results;

      const projectFieldMapping = that.mappingSettings.filter(
        setting => (setting.source_field === 'PROJECT' && setting.destination_field === 'PROJECT')
      );

      let importProjects = false;
      if (projectFieldMapping.length) {
        importProjects = projectFieldMapping[0].import_to_fyle;
      }

      that.expenseOptions = [{
        label: 'Expense Report',
        value: 'EXPENSE_REPORT'
      },
      {
        label: 'Bill',
        value: 'BILL'
      }];

      that.cccExpenseOptions = that.getCCCExpenseOptions(that.configuration.reimbursable_expenses_object);

      let paymentsSyncOption = '';
      if (that.configuration.sync_fyle_to_sage_intacct_payments) {
        paymentsSyncOption = 'sync_fyle_to_sage_intacct_payments';
      } else if (that.configuration.sync_sage_intacct_to_fyle_payments) {
        paymentsSyncOption = 'sync_sage_intacct_to_fyle_payments';
      }

      that.configurationForm = that.formBuilder.group({
        reimburExpense: [that.configuration ? that.configuration.reimbursable_expenses_object : ''],
        cccExpense: [that.configuration ? that.configuration.corporate_credit_card_expenses_object : ''],
        importProjects: [importProjects],
        importCategories: [that.configuration.import_categories],
        paymentsSync: [paymentsSyncOption],
        autoMapEmployees: [that.configuration.auto_map_employees],
        autoCreateDestinationEntity: [that.configuration.auto_create_destination_entity]
      });

      const fyleProjectMapping = that.mappingSettings.filter(
        setting => setting.source_field === 'PROJECT' && setting.destination_field !== 'PROJECT'
      );

      const sageIntacctProjectMapping = that.mappingSettings.filter(
        setting => setting.destination_field === 'PROJECT' && setting.source_field !== 'PROJECT'
      );

      // disable project sync toggle if either of Fyle / Sage Intacct Projects are already mapped to different fields
      if (fyleProjectMapping.length || sageIntacctProjectMapping.length) {
        that.configurationForm.controls.importProjects.disable();
      }

      that.showAutoCreateOption(that.configuration.auto_map_employees);

      that.configurationForm.controls.reimburExpense.disable();

      that.configurationForm.controls.autoMapEmployees.valueChanges.subscribe((employeeMappingPreference) => {
        that.showAutoCreateOption(employeeMappingPreference);
      });

      if (that.configuration.corporate_credit_card_expenses_object) {
        that.configurationForm.controls.cccExpense.disable();
      }

      that.isLoading = false;
    }, () => {
      that.isLoading = false;
      that.mappingSettings = [];
      that.configurationForm = that.formBuilder.group({
        reimburExpense: ['', Validators.required],
        cccExpense: [null],
        importProjects: [false],
        importCategories: [false],
        paymentsSync: [null],
        autoMapEmployees: [null],
        autoCreateDestinationEntity: [false]
      });

      that.configurationForm.controls.autoMapEmployees.valueChanges.subscribe((employeeMappingPreference) => {
        that.showAutoCreateOption(employeeMappingPreference);
      });

      that.configurationForm.controls.reimburExpense.valueChanges.subscribe((reimburseExpenseMappingPreference) => {
        that.cccExpenseOptions = that.getCCCExpenseOptions(reimburseExpenseMappingPreference);
      });

      that.expenseOptions = [{
        label: 'Expense Report',
        value: 'EXPENSE_REPORT'
      },
      {
        label: 'Bill',
        value: 'BILL'
      }];

      that.cccExpenseOptions = that.getCCCExpenseOptions();
    });
  }

  save() {
    const that = this;

    const reimbursableExpensesObject = that.configurationForm.value.reimburExpense || (that.configuration ? that.configuration.reimbursable_expenses_object : null);
    const cccExpensesObject = that.configurationForm.value.cccExpense || (that.configuration ? that.configuration.corporate_credit_card_expenses_object : null);
    const categoryMappingObject = that.getCategory(reimbursableExpensesObject)[0].value;
    const employeeMappingsObject = that.getEmployee(reimbursableExpensesObject)[0].value;
    const importProjects = that.configurationForm.value.importProjects;
    const importCategories = that.configurationForm.value.importCategories;
    const autoMapEmployees = that.configurationForm.value.autoMapEmployees ? that.configurationForm.value.autoMapEmployees : null;
    const autoCreateDestinationEntity = that.configurationForm.value.autoCreateDestinationEntity;

    let fyleToSageIntacct = false;
    let sageIntacctToFyle = false;

    const mappingsSettingsPayload: MappingSetting[] = [{
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
        destination_field: 'PROJECT',
        import_to_fyle: true
      });
    } else {
      const projectFieldMapping = that.mappingSettings.filter(
        setting => (setting.source_field === 'PROJECT' && setting.destination_field === 'PROJECT')
      );

      if (projectFieldMapping.length) {
        mappingsSettingsPayload.push({
          source_field: 'PROJECT',
          destination_field: 'PROJECT',
          import_to_fyle: false
        });
      }
    }

    if (cccExpensesObject === 'CHARGE_CARD_TRANSACTION') {
      mappingsSettingsPayload.push({
        source_field: 'EMPLOYEE',
        destination_field: 'CHARGE_CARD_NUMBER'
      });
    }

    if (cccExpensesObject === 'BILL' || cccExpensesObject === 'CHARGE_CARD_TRANSACTION') {
      mappingsSettingsPayload.push({
        source_field: 'CATEGORY',
        destination_field: 'CCC_ACCOUNT'
      });
    }

    if (that.configurationForm.controls.paymentsSync.value) {
      fyleToSageIntacct = that.configurationForm.value.paymentsSync === 'sync_fyle_to_sage_intacct_payments' ? true : false;
      sageIntacctToFyle = that.configurationForm.value.paymentsSync === 'sync_sage_intacct_to_fyle_payments' ? true : false;
    }

    that.isLoading = true;

    forkJoin(
      [
        that.settingsService.postMappingSettings(that.workspaceId, mappingsSettingsPayload),
        that.settingsService.postConfiguration(that.workspaceId, reimbursableExpensesObject, cccExpensesObject, importProjects, importCategories, fyleToSageIntacct, sageIntacctToFyle, autoCreateDestinationEntity, autoMapEmployees)
      ]
    ).subscribe(() => {
      that.isLoading = true;
      that.snackBar.open('Configuration saved successfully');

      that.si.getGeneralSettings();

      if (autoMapEmployees) {
        setTimeout(() => {
          that.snackBar.open('Auto mapping of employees may take few minutes');
        }, 1500);
      }

      that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);

      that.isLoading = false;
    });
  }

  showAutoCreateOption(autoMapEmployees) {
    const that = this;
    if (autoMapEmployees && autoMapEmployees !== 'EMPLOYEE_CODE') {
      that.showAutoCreate = true;
    } else {
      that.showAutoCreate = false;
      that.configurationForm.controls.autoCreateDestinationEntity.setValue(false);
    }
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = that.route.snapshot.parent.parent.params.workspace_id;

    that.isLoading = true;

    that.getAllSettings();
  }

}
