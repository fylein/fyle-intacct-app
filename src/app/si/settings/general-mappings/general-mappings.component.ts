import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MappingsService } from '../../../core/services/mappings.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from 'src/app/core/services/settings.service';
import { GeneralMapping } from 'src/app/core/models/general-mapping.model';
import { MappingDestination } from 'src/app/core/models/mapping-destination.model';
import { GroupedDestinationAttributes } from 'src/app/core/models/grouped-destination-attributes';
import { Configuration } from 'src/app/core/models/configuration.model';
import { TouchSequence } from 'selenium-webdriver';
import { MappingSetting } from 'src/app/core/models/mapping-setting.model';

@Component({
  selector: 'app-general-mappings',
  templateUrl: './general-mappings.component.html',
  styleUrls: ['./general-mappings.component.scss', '../../si.component.scss']
})
export class GeneralMappingsComponent implements OnInit {
  form: FormGroup;
  workspaceId: number;
  generalMappings: GeneralMapping;
  isLoading = true;
  sageIntacctLocations: MappingDestination[];
  sageIntacctLocationEntities: MappingDestination[];
  sageIntacctDepartments: MappingDestination[];
  sageIntacctProjects: MappingDestination[];
  sageIntacctDefaultVendor: MappingDestination[];
  sageIntacctDefaultChargeCard: MappingDestination[];
  sageIntacctDefaultItem: MappingDestination[];
  sageIntacctPaymentAccounts: MappingDestination[];
  defaultVendor: MappingDestination[];
  defaultChargeCard: MappingDestination[];
  defaultItem: MappingDestination[];
  paymentAccount: MappingDestination[];
  sageIntacctReimbursableExpensePaymentType: MappingDestination[];
  sageIntacctCCCExpensePaymentType: MappingDestination[];
  sageIntacctClasses: MappingDestination[];
  taxCodes: MappingDestination[];
  configuration: Configuration;
  projectMappingSetting: MappingSetting[];


  constructor(
    private route: ActivatedRoute,
    private mappingsService: MappingsService,
    private settingsService: SettingsService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar) {
  }

  submit() {
    const that = this;
    that.isLoading = true;
    const locationEntityName: MappingDestination[] = that.sageIntacctLocationEntities.filter((element) => element.destination_id === that.form.value.locationEntity);
    const defaultLocationName: MappingDestination[] = that.sageIntacctLocations.filter((element) => element.destination_id === that.form.value.location);
    const defaultDepartmentName: MappingDestination[] = that.sageIntacctDepartments.filter((element) => element.destination_id === that.form.value.department);
    const defaultProjectName: MappingDestination[] = that.sageIntacctProjects.filter((element) => element.destination_id === that.form.value.project);
    const defaultVendor: MappingDestination[] = that.sageIntacctDefaultVendor.filter((element) => element.destination_id === that.form.value.defaultVendor);
    const defaultClass: MappingDestination[] = that.sageIntacctClasses.filter((element) => element.destination_id === that.form.value.defaultClass);
    const defaultChargeCard: MappingDestination[] = that.sageIntacctDefaultChargeCard.filter((element) => element.destination_id === that.form.value.chargeCard);
    const defaultItem: MappingDestination[] = that.sageIntacctDefaultItem.filter((element) => element.destination_id === that.form.value.defaultItem);
    const paymentAccount: MappingDestination[] = that.sageIntacctPaymentAccounts.filter((element) => element.destination_id === that.form.value.paymentAccount);
    const defaultReimbursableExpensePaymentType: MappingDestination[] = that.sageIntacctReimbursableExpensePaymentType.filter((element) => element.destination_id === that.form.value.defaultReimbursableExpensePaymentType);
    const defaultCCCExpensePaymentType: MappingDestination[] = that.sageIntacctCCCExpensePaymentType.filter((element) => element.destination_id === that.form.value.defaultCCCExpensePaymentType);
    const defaultEmployeeLocation = that.form.value.useDefaultEmployeeLocation;
    const defaultEmployeeDepartment = that.form.value.useDefaultEmployeeDepartment;

    const defaultTaxCodeId = that.form.value.sageIntacctTaxCodes;
    const defaultTaxCode = that.taxCodes.filter(filteredTaxCode => filteredTaxCode.destination_id === defaultTaxCodeId)[0];

    const mapping: GeneralMapping = {
      location_entity_name: locationEntityName[0] ? locationEntityName[0].value : '',
      location_entity_id: that.form.value.locationEntity ? that.form.value.locationEntity : '',
      default_location_name: defaultLocationName[0] ? defaultLocationName[0].value : '',
      default_location_id: that.form.value.location ? that.form.value.location : '',
      default_department_name: defaultDepartmentName[0] ? defaultDepartmentName[0].value : '',
      default_department_id: that.form.value.department ? that.form.value.department : '',
      default_project_name: defaultProjectName[0] ? defaultProjectName[0].value : '',
      default_project_id: that.form.value.project ? that.form.value.project : '',
      default_ccc_vendor_name: defaultVendor[0] ? defaultVendor[0].value : '',
      default_ccc_vendor_id: that.form.value.defaultVendor ? that.form.value.defaultVendor : '',
      default_class_name: defaultClass[0] ? defaultClass[0].value : '',
      default_class_id: that.form.value.defaultClass ? that.form.value.defaultClass : '',
      default_charge_card_name: defaultChargeCard[0] ? defaultChargeCard[0].value : '',
      default_charge_card_id: that.form.value.chargeCard ? that.form.value.chargeCard : '',
      default_item_id: that.form.value.defaultItem ? that.form.value.defaultItem : '',
      default_item_name: defaultItem[0] ? defaultItem[0].value : '',
      payment_account_name: paymentAccount[0] ? paymentAccount[0].value : '',
      payment_account_id: that.form.value.paymentAccount ? that.form.value.paymentAccount : '',
      default_reimbursable_expense_payment_type_id: that.form.value.defaultReimbursableExpensePaymentType ? that.form.value.defaultReimbursableExpensePaymentType : '',
      default_reimbursable_expense_payment_type_name: defaultReimbursableExpensePaymentType[0] ? defaultReimbursableExpensePaymentType[0].value : '',
      default_ccc_expense_payment_type_id: that.form.value.defaultCCCExpensePaymentType ? that.form.value.defaultCCCExpensePaymentType : '',
      default_ccc_expense_payment_type_name: defaultCCCExpensePaymentType[0] ? defaultCCCExpensePaymentType[0].value : null,
      use_intacct_employee_departments: defaultEmployeeDepartment,
      use_intacct_employee_locations: defaultEmployeeLocation,
      default_tax_code_name: defaultTaxCode ? defaultTaxCode.value : null,
      default_tax_code_id: defaultTaxCode ? defaultTaxCode.destination_id : null
    };

    that.setMandatoryFields();

    that.mappingsService.postGeneralMappings(mapping).subscribe(() => {
      that.isLoading = false;
      that.snackBar.open('General mappings saved successfully');
      that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
    }, () => {
      that.isLoading = false;
      that.snackBar.open('Please fill all required fields');
    });
  }

  setMandatoryFields() {
      const that = this;

      if (that.configuration.corporate_credit_card_expenses_object && this.configuration.corporate_credit_card_expenses_object === 'CHARGE_CARD_TRANSACTION') {
        that.form.controls.chargeCard.setValidators(Validators.required);
      }

      if (that.configuration.corporate_credit_card_expenses_object && that.configuration.corporate_credit_card_expenses_object === 'BILL') {
        that.form.controls.defaultVendor.setValidators(Validators.required);
      }

      if (that.configuration.sync_fyle_to_sage_intacct_payments) {
        that.form.controls.paymentAccount.setValidators(Validators.required);
      }

      if (that.configuration.corporate_credit_card_expenses_object === 'EXPENSE_REPORT') {
        that.form.controls.defaultCCCExpensePaymentType.setValidators(Validators.required);
      }

      if (that.projectMappingSetting.length) {
        that.form.controls.defaultItem.setValidators(Validators.required);
      }

      if (that.configuration.import_tax_codes) {
        that.form.controls.sageIntacctTaxCodes.setValidators(Validators.required);
      }

  }

  isFieldMandatory(controlName: string) {
    const abstractControl = this.form.controls[controlName];
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return true;
      }
    }

    return false;
  }

  getAttributesFilteredByConfig() {
    const attributes = [
      'LOCATION', 'DEPARTMENT', 'PROJECT', 'LOCATION_ENTITY', 'CLASS',
    ];

    if (this.configuration.reimbursable_expenses_object === 'EXPENSE_REPORT') {
        attributes.push('EXPENSE_REPORT');
    }

    if (this.configuration.corporate_credit_card_expenses_object && this.configuration.corporate_credit_card_expenses_object === 'CHARGE_CARD_TRANSACTION') {
        attributes.push('CHARGE_CARD_NUMBER');
    }

    if (this.configuration.corporate_credit_card_expenses_object && this.configuration.corporate_credit_card_expenses_object === 'BILL') {
        attributes.push('VENDOR');
    }

    if (this.configuration.corporate_credit_card_expenses_object === 'EXPENSE_REPORT') {
        attributes.push('EXPENSE_PAYMENT_TYPE');
    }

    if (this.configuration.sync_fyle_to_sage_intacct_payments) {
        attributes.push('PAYMENT_ACCOUNT');
    }

    if (this.projectMappingSetting.length) {
      attributes.push('ITEM');
    }

    if (this.configuration.import_tax_codes) {
      attributes.push('TAX_DETAIL');
    }
  
    return attributes;
  }

  reset() {
    const that = this;
    that.isLoading = true;

    const attributes = this.getAttributesFilteredByConfig();

    that.mappingsService.getGroupedSageIntacctDestinationAttributes(attributes).subscribe(response => {
      that.isLoading = false;
      that.sageIntacctLocations = response.LOCATION;
      that.sageIntacctDepartments = response.DEPARTMENT;
      that.sageIntacctProjects = response.PROJECT;
      that.sageIntacctDefaultVendor = response.VENDOR;
      that.sageIntacctDefaultChargeCard = response.CHARGE_CARD_NUMBER;
      that.sageIntacctDefaultItem = response.ITEM;
      that.sageIntacctPaymentAccounts = response.PAYMENT_ACCOUNT;
      that.sageIntacctReimbursableExpensePaymentType = response.EXPENSE_PAYMENT_TYPE.filter(expensePaymentType => expensePaymentType.detail.is_reimbursable);
      that.sageIntacctCCCExpensePaymentType = response.EXPENSE_PAYMENT_TYPE.filter(expensePaymentType => expensePaymentType.detail.is_reimbursable === false);
      that.sageIntacctLocationEntities = response.LOCATION_ENTITY;
      that.sageIntacctClasses = response.CLASS;
      that.taxCodes = response.TAX_DETAIL;

      that.form = that.formBuilder.group({
        locationEntity: [that.generalMappings ? that.generalMappings.location_entity_id : null],
        location: [that.generalMappings ? that.generalMappings.default_location_id : null],
        chargeCard: [that.generalMappings ? that.generalMappings.default_charge_card_id : null],
        defaultVendor: [that.generalMappings ? that.generalMappings.default_ccc_vendor_id : null],
        defaultItem: [that.generalMappings ? that.generalMappings.default_item_id : null],
        department: [that.generalMappings ? that.generalMappings.default_department_id : null],
        defaultClass: [that.generalMappings ? that.generalMappings.default_class_id : null],
        project: [that.generalMappings ? that.generalMappings.default_project_id : null],
        paymentAccount: [that.generalMappings ? that.generalMappings.payment_account_id : null],
        defaultReimbursableExpensePaymentType: [that.generalMappings ? that.generalMappings.default_reimbursable_expense_payment_type_id : null],
        // defaultCCCExpensePaymentType should be a mandatory field for Expense Reports to mark it as non reimbursable for ccc expenses
        defaultCCCExpensePaymentType: [that.generalMappings ? that.generalMappings.default_ccc_expense_payment_type_id : null, that.configuration.corporate_credit_card_expenses_object === 'EXPENSE_REPORT' ? Validators.required : null],
        useDefaultEmployeeLocation: [that.generalMappings ? that.generalMappings.use_intacct_employee_locations : false],
        useDefaultEmployeeDepartment: [that.generalMappings ? that.generalMappings.use_intacct_employee_departments : false],
        sageIntacctTaxCodes: [that.generalMappings ? that.generalMappings.default_tax_code_id : '']
      });

      that.setMandatoryFields();
    });
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = +that.route.parent.snapshot.params.workspace_id;
    that.isLoading = true;

    forkJoin(
      [
        that.settingsService.getConfiguration(that.workspaceId),
        this.settingsService.getMappingSettings(this.workspaceId)
      ]
    ).subscribe((responses) => {
      that.configuration = responses[0];
      that.projectMappingSetting = responses[1].results.filter(
        setting => setting.destination_field === 'PROJECT'
      );

      that.mappingsService.getGeneralMappings().subscribe(res => {
        console.log('res', res)
        that.generalMappings = res;
        that.reset();
      }, () => {
        that.reset();
      });
    });
  }
}
