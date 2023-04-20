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
import { MatDialog } from '@angular/material/dialog';
import { UpdatedConfiguration } from 'src/app/core/models/updated-configuration';
import { ConfigurationDialogComponent } from './configuration-dialog/configuration-dialog.component';

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
  entityCountry: string;
  isTaxesEnabled = false;
  showImportCategories: boolean;

  constructor(private formBuilder: FormBuilder,
              private settingsService: SettingsService,
              private mappingService: MappingsService,
              private route: ActivatedRoute,
              private router: Router,
              private snackBar: MatSnackBar,
              private si: SiComponent,
              private windowReferenceService: WindowReferenceService,
              public dialog: MatDialog) {
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
      ],
      JOURNAL_ENTRY: [
        {
          value: this.configurationForm.controls.employeeFieldMapping.value
        }
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
      ],
      JOURNAL_ENTRY: [
        {
        value: 'ACCOUNT'
      }
    ]
    }[reimburExpenseMappedTo];
  }

  getCCCExpenseOptions(reimburExpenseMappedTo = null, employeesMappedTo = null) {
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

    if (reimburExpenseMappedTo === 'EXPENSE_REPORT' || (reimburExpenseMappedTo === 'JOURNAL_ENTRY' && employeesMappedTo === 'EMPLOYEE')) {
      cccExpenseOptions.push({
        label: 'Expense Report',
        value: 'EXPENSE_REPORT'
      });
    }

    return cccExpenseOptions;
  }

  setFormValues() {
    const that = this;

    that.showAutoCreateOption(that.configuration.auto_map_employees);
    that.cccExpenseOptions = that.getCCCExpenseOptions(that.configuration.reimbursable_expenses_object, that.configuration.employee_field_mapping);
    that.showImportCategories = true;

    if (that.configuration.corporate_credit_card_expenses_object && that.configuration.corporate_credit_card_expenses_object === 'CHARGE_CARD_TRANSACTION') {
      that.showAutoCreate = true;
    }
  }

  setupProjectsField() {
    const that = this;

    const fyleProjectMapping = that.mappingSettings.filter(
      setting => setting.source_field === 'PROJECT' && setting.destination_field !== 'PROJECT'
    );

    const sageIntacctProjectMapping = that.mappingSettings.filter(
      setting => setting.destination_field === 'PROJECT' && setting.source_field !== 'PROJECT'
    );

    // disable project sync toggle if either of Fyle / SageIntacct Projects are already mapped to different fields
    if (fyleProjectMapping.length || sageIntacctProjectMapping.length) {
      that.configurationForm.controls.importProjects.disable();
    }
  }

  setupReimbursableFieldWatcher() {
    const that = this;
    that.configurationForm.controls.reimburExpense.valueChanges.subscribe((reimbursableExpenseMappedTo) => {
      that.configurationForm.controls.cccExpense.reset();
      that.cccExpenseOptions = that.getCCCExpenseOptions(reimbursableExpenseMappedTo);

      if (reimbursableExpenseMappedTo) {
        // employeeFieldMapping
        that.setupEmployeesFieldWatcher(reimbursableExpenseMappedTo);

        if (!that.showImportCategories) {
          that.showImportCategories = true;
        }

        if (reimbursableExpenseMappedTo === 'JOURNAL_ENTRY') {
          that.configurationForm.controls.employeeFieldMapping.reset();
          // Add validators for the 'employeeFieldMapping' form control
          that.configurationForm.controls.employeeFieldMapping.setValidators([Validators.required]);

          // Update the form control's value and validation state
          that.configurationForm.controls.employeeFieldMapping.updateValueAndValidity();
        } else {
          that.configurationForm.controls.employeeFieldMapping.reset();

          // Clear validators for the 'employeeFieldMapping' form control
          that.configurationForm.controls.employeeFieldMapping.clearValidators();

          // Update the form control's value and validation state
          that.configurationForm.controls.employeeFieldMapping.updateValueAndValidity();
        }

        if (that.configuration && that.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT' && reimbursableExpenseMappedTo !== 'EXPENSE_REPORT') {
          // turn off the import categories toggle when the user switches from EXPENSE REPORT to something else
          that.configurationForm.controls.importCategories.setValue(false);
        }
      }
    });
  }

  setupEmployeesFieldWatcher(reimbursableExpense) {
    const that = this;
    that.configurationForm.controls.employeeFieldMapping.valueChanges.subscribe((employeesMappedTo) => {
        that.configurationForm.controls.cccExpense.reset();
        that.cccExpenseOptions = that.getCCCExpenseOptions(reimbursableExpense, employeesMappedTo);
      });
  }

  setupFieldWatchers() {
    const that = this;

    if (that.configuration) {
      that.setFormValues();
      if (that.configuration.reimbursable_expenses_object === 'JOURNAL_ENTRY') {
        that.setupEmployeesFieldWatcher('JOURNAL_ENTRY');
      }
    }

    // Auto Create Destination Entity
    that.configurationForm.controls.autoMapEmployees.valueChanges.subscribe((employeeMappingPreference) => {
      that.showAutoCreateOption(employeeMappingPreference);
    });

    // Reimbursable Expense Mapping
    that.setupReimbursableFieldWatcher();

    // Auto Create Merchant
    that.configurationForm.controls.cccExpense.valueChanges.subscribe((cccExpenseMappedTo) => {
      if (cccExpenseMappedTo === 'CHARGE_CARD_TRANSACTION') {
        that.showAutoCreate = true;
      }
    });

    that.setupProjectsField();
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
        label: 'Journal Entry',
        value: 'JOURNAL_ENTRY'
      },
      {
        label: 'Bill',
        value: 'BILL'
      }];

      that.cccExpenseOptions = that.getCCCExpenseOptions(that.configuration.reimbursable_expenses_object, that.configuration.employee_field_mapping);

      let paymentsSyncOption = '';
      if (that.configuration.sync_fyle_to_sage_intacct_payments) {
        paymentsSyncOption = 'sync_fyle_to_sage_intacct_payments';
      } else if (that.configuration.sync_sage_intacct_to_fyle_payments) {
        paymentsSyncOption = 'sync_sage_intacct_to_fyle_payments';
      }

      that.configurationForm = that.formBuilder.group({
        reimburExpense: [that.configuration ? that.configuration.reimbursable_expenses_object : '', Validators.required],
        employeeFieldMapping: [that.configuration ? that.configuration.employee_field_mapping : ''],
        cccExpense: [that.configuration ? that.configuration.corporate_credit_card_expenses_object : ''],
        importProjects: [importProjects],
        importCategories: [that.configuration.import_categories],
        paymentsSync: [paymentsSyncOption],
        autoMapEmployees: [that.configuration.auto_map_employees],
        autoCreateDestinationEntity: [that.configuration.auto_create_destination_entity],
        importTaxCodes: [that.configuration.import_tax_codes],
        changeAccountingPeriod: [that.configuration.change_accounting_period],
        importVendorsAsMerchants: [that.configuration.import_vendors_as_merchants]
      });

      if (!that.entityCountry || that.entityCountry === 'United States') {
        that.configurationForm.controls.importTaxCodes.disable();
      }

      that.setupFieldWatchers();

      that.isLoading = false;
    }, () => {
      that.isLoading = false;
      that.mappingSettings = [];
      that.configurationForm = that.formBuilder.group({
        reimburExpense: ['', Validators.required],
        employeeFieldMapping: [''],
        cccExpense: [null],
        importProjects: [false],
        importCategories: [false],
        paymentsSync: [null],
        autoMapEmployees: [null],
        autoCreateDestinationEntity: [false],
        importTaxCodes: [null],
        changeAccountingPeriod: [false],
        importVendorsAsMerchants: [false]
      });

      that.setupFieldWatchers();

      if (!that.entityCountry || that.entityCountry === 'United States') {
        that.configurationForm.controls.importTaxCodes.disable();
      }

      that.expenseOptions = [{
        label: 'Expense Report',
        value: 'EXPENSE_REPORT'
      },
      {
        label: 'Journal Entry',
        value: 'JOURNAL_ENTRY'
      },
      {
        label: 'Bill',
        value: 'BILL'
      }];

      that.cccExpenseOptions = that.getCCCExpenseOptions();
    });
  }

  openDialog(updatedConfigurations: UpdatedConfiguration, configurationPayload: Configuration, mappingSettingsPayload: MappingSetting[]) {
    const that = this;
    const dialogRef = that.dialog.open(ConfigurationDialogComponent, {
      width: '750px',
      data: updatedConfigurations
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data.accpetedChanges) {
        that.postConfigurationsAndMappingSettings(configurationPayload, mappingSettingsPayload, true, data.redirectToEmployeeMappings);
      }
    });
  }


  constructUpdatedConfigurationsPayload(generalSettingsPayload: Configuration): UpdatedConfiguration {
    const that = this;
    const updatedConfiguration: UpdatedConfiguration = {
      autoCreateDestinationEntity: generalSettingsPayload.auto_create_destination_entity
    };

    if (that.configuration.employee_field_mapping !== generalSettingsPayload.employee_field_mapping) {
      updatedConfiguration.employee = {
        oldValue: that.configuration.employee_field_mapping,
        newValue: generalSettingsPayload.employee_field_mapping
      };
    }

    if (that.configuration.reimbursable_expenses_object !== generalSettingsPayload.reimbursable_expenses_object) {
      updatedConfiguration.reimburseExpense = {
        oldValue: that.configuration.reimbursable_expenses_object,
        newValue: generalSettingsPayload.reimbursable_expenses_object
      };
    }

    if (that.configuration.corporate_credit_card_expenses_object !== generalSettingsPayload.corporate_credit_card_expenses_object) {
      updatedConfiguration.cccExpense = {
        oldValue: that.configuration.corporate_credit_card_expenses_object,
        newValue: generalSettingsPayload.corporate_credit_card_expenses_object
      };
    }

    return updatedConfiguration;
  }

  postConfigurationsAndMappingSettings(configurationPayload: Configuration, mappingSettingsPayload: MappingSetting[], redirectToGeneralMappings: boolean = false, redirectToEmployeeMappings: boolean = false) {
    const that = this;
    that.isLoading = true;

    that.settingsService.postConfiguration(that.workspaceId, configurationPayload).subscribe(() => {
      if (mappingSettingsPayload.length) {
        that.settingsService.postMappingSettings(that.workspaceId, mappingSettingsPayload).subscribe(() => {
          that.isLoading = false;
          that.snackBar.open('Configuration saved successfully');
          that.si.getGeneralSettings();
        });
      } else {
        that.isLoading = false;
        that.snackBar.open('Configuration saved successfully');
        that.si.getGeneralSettings();
      }

      if (redirectToGeneralMappings) {
        if (redirectToEmployeeMappings) {
          // add redirect_to_employee_mappings query param
          that.router.navigate([`workspaces/${that.workspaceId}/settings/general/mappings`], {
            queryParams: {
              redirect_to_employee_mappings: redirectToEmployeeMappings
            }
          });
        } else {
          that.router.navigateByUrl(`workspaces/${that.workspaceId}/settings/general/mappings`);
        }
      } else {
        that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
      }
    }, () => {
      that.isLoading = false;
      that.snackBar.open('Saving configurations failed');
    });
  }


  constructConfigurationsPayload(): Configuration {
    const that = this;

    const reimbursableExpensesObject = that.configurationForm.getRawValue().reimburExpense;
    const cccExpensesObject = that.configurationForm.getRawValue().cccExpense ? that.configurationForm.getRawValue().cccExpense : null;
    const categoryMappingObject = that.getCategory(reimbursableExpensesObject)[0].value;
    const employeeMappingsObject = that.getEmployee(reimbursableExpensesObject)[0].value;
    const importProjects = that.configurationForm.value.importProjects;
    const importCategories = that.configurationForm.value.importCategories;
    const autoMapEmployees = that.configurationForm.value.autoMapEmployees ? that.configurationForm.value.autoMapEmployees : null;
    const autoCreateDestinationEntity = that.configurationForm.value.autoCreateDestinationEntity;
    const importTaxCodes = that.configurationForm.value.importTaxCodes ? that.configurationForm.value.importTaxCodes : false;
    const changeAccountingPeriod = that.configurationForm.value.changeAccountingPeriod ? that.configurationForm.value.changeAccountingPeriod : false;
    const importVendorAsMerchants = that.configurationForm.value.importVendorsAsMerchants ? that.configurationForm.value.importVendorsAsMerchants : false;
    const isSimplifyReportClosureEnabled = that.configurationForm.value.is_simplify_report_closure_enabled ? that.configurationForm.value.is_simplify_report_closure_enabled : false;
    let fyleToSageIntacct = false;
    let sageIntacctToFyle = false;

    if (that.configurationForm.controls.paymentsSync.value) {
      fyleToSageIntacct = that.configurationForm.value.paymentsSync === 'sync_fyle_to_sage_intacct_payments' ? true : false;
      sageIntacctToFyle = that.configurationForm.value.paymentsSync === 'sync_sage_intacct_to_fyle_payments' ? true : false;
    }

    return {
      is_simplify_report_closure_enabled: isSimplifyReportClosureEnabled,
      employee_field_mapping: employeeMappingsObject,
      reimbursable_expenses_object: reimbursableExpensesObject,
      corporate_credit_card_expenses_object: cccExpensesObject,
      import_projects: importProjects,
      import_categories: importCategories,
      sync_fyle_to_sage_intacct_payments: fyleToSageIntacct,
      sync_sage_intacct_to_fyle_payments: sageIntacctToFyle,
      auto_map_employees: autoMapEmployees,
      auto_create_destination_entity: autoCreateDestinationEntity,
      import_tax_codes: importTaxCodes,
      change_accounting_period: changeAccountingPeriod,
      import_vendors_as_merchants: importVendorAsMerchants,
      workspace: that.workspaceId
    };
  }

  constructMappingSettingsPayload(): MappingSetting[] {
    const that = this;

    const reimbursableExpensesObject = that.configurationForm.getRawValue().reimburExpense;
    const employeeMappingsObject = that.getEmployee(reimbursableExpensesObject)[0].value;
    const categoryMappingObject = that.getCategory(reimbursableExpensesObject)[0].value;

    const mappingsSettingsPayload: MappingSetting[] = [{
      source_field: 'EMPLOYEE',
      destination_field: employeeMappingsObject
    }];

    const importProjects = that.configurationForm.value.importProjects ? that.configurationForm.value.importProjects : false;
    const importTaxCodes = that.configurationForm.value.importTaxCodes ? that.configurationForm.value.importTaxCodes : false;
    const isCCTExportEnabled = that.configurationForm.value.cccExpense === 'CHARGE_CARD_TRANSACTION' ? true : false;

    if (importTaxCodes) {
      mappingsSettingsPayload.push({
        source_field: 'TAX_GROUP',
        destination_field: 'TAX_DETAIL'
      });
    }

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

    if (isCCTExportEnabled) {
      mappingsSettingsPayload.push({
        source_field: 'CORPORATE_CARD',
        destination_field: 'CHARGE_CARD_NUMBER'
      });
    }
    return mappingsSettingsPayload;
  }

  save() {
    const that = this;

    const configurationPayload: Configuration = that.constructConfigurationsPayload();
    const mappingSettingsPayload: MappingSetting[] = that.constructMappingSettingsPayload();

        // Open dialog conditionally
    if (that.configuration && (that.configuration.employee_field_mapping !== configurationPayload.employee_field_mapping || that.configuration.reimbursable_expenses_object !== configurationPayload.reimbursable_expenses_object || that.configuration.corporate_credit_card_expenses_object !== configurationPayload.corporate_credit_card_expenses_object)) {
      const updatedConfigurations = that.constructUpdatedConfigurationsPayload(configurationPayload);
      that.openDialog(updatedConfigurations, configurationPayload, mappingSettingsPayload);
    } else {
      that.postConfigurationsAndMappingSettings(configurationPayload, mappingSettingsPayload);
    }
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

    that.mappingService.getLocationEntityMapping().subscribe((mapping) => {
       that.entityCountry = mapping.country_name;
       that.getAllSettings();
    });
  }

}
