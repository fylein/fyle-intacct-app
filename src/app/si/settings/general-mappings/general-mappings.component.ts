import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MappingsService } from '../../../core/services/mappings.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from 'src/app/core/services/settings.service';
import { GeneralMapping } from 'src/app/core/models/general-mapping.model';
import { MappingDestination } from 'src/app/core/models/mapping-destination.model';
import { GeneralSetting } from 'src/app/core/models/general-setting.model';

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
  generalSettings: GeneralSetting;

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

    const defaultLocationName: MappingDestination[] = that.sageIntacctLocations.filter((element) => element.destination_id === that.form.value.location);
    const defaultDepartmentName: MappingDestination[] = that.sageIntacctDepartments.filter((element) => element.destination_id === that.form.value.department);
    const defaultProjectName: MappingDestination[] = that.sageIntacctProjects.filter((element) => element.destination_id === that.form.value.project);
    const defaultVendor: MappingDestination[] = that.sageIntacctDefaultVendor.filter((element) => element.destination_id === that.form.value.defaultVendor);
    const defaultChargeCard: MappingDestination[] = that.sageIntacctDefaultChargeCard.filter((element) => element.destination_id === that.form.value.chargeCard);
    const defaultItem: MappingDestination[] = that.sageIntacctDefaultItem.filter((element) => element.destination_id === that.form.value.defaultItem);
    const paymentAccount: MappingDestination[] = that.sageIntacctPaymentAccounts.filter((element) => element.destination_id === that.form.value.paymentAccount);

    const mapping: GeneralMapping = {
      default_location_name: defaultLocationName[0] ? defaultLocationName[0].value : '',
      default_location_id: that.form.value.location ? that.form.value.location : '',
      default_department_name: defaultDepartmentName[0] ? defaultDepartmentName[0].value : '',
      default_department_id: that.form.value.department ? that.form.value.department : '',
      default_project_name: defaultProjectName[0] ? defaultProjectName[0].value : '',
      default_project_id: that.form.value.project ? that.form.value.project : '',
      default_ccc_vendor_name: defaultVendor[0] ? defaultVendor[0].value : '',
      default_ccc_vendor_id: that.form.value.defaultVendor ? that.form.value.defaultVendor : '',
      default_charge_card_name: defaultChargeCard[0] ? defaultChargeCard[0].value : '',
      default_charge_card_id: that.form.value.chargeCard ? that.form.value.chargeCard : '',
      default_item_id: that.form.value.defaultItem ? that.form.value.defaultItem : '',
      default_item_name: defaultItem[0] ? defaultItem[0].value : '',
      payment_account_name: paymentAccount[0] ? paymentAccount[0].value : '',
      payment_account_id: that.form.value.paymentAccount ? that.form.value.paymentAccount : ''
    };

    that.mappingsService.postGeneralMappings(mapping).subscribe(response => {
      that.isLoading = false;
      that.snackBar.open('General mappings saved successfully');
      that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
    }, (error) => {
      that.isLoading = false;
      that.snackBar.open('Please fill all required fields');
    });
  }


  reset() {
    const that = this;
    that.isLoading = true;

    that.settingsService.getGeneralSettings(that.workspaceId).subscribe((setting: GeneralSetting) => {
      that.generalSettings = setting;
    });

    forkJoin(
      [
        that.mappingsService.getSageIntacctLocations(),
        that.mappingsService.getSageIntacctDepartments(),
        that.mappingsService.getSageIntacctProjects(),
        that.mappingsService.getSageIntacctVendors(),
        that.mappingsService.getSageIntacctChargeCard(),
        that.mappingsService.getSageIntacctItems(),
        that.mappingsService.getSageIntacctPaymentAccounts(),
      ]
    ).subscribe(response => {
      that.isLoading = false;

      that.sageIntacctLocations = response[0];
      that.sageIntacctDepartments = response[1];
      that.sageIntacctProjects = response[2];
      that.sageIntacctDefaultVendor = response[3];
      that.sageIntacctDefaultChargeCard = response[4];
      that.sageIntacctDefaultItem = response[5];
      that.sageIntacctPaymentAccounts = response[6];

      that.form = that.formBuilder.group({
        location: [that.generalMappings ? that.generalMappings.default_location_id : null],
        chargeCard: [that.generalMappings ? that.generalMappings.default_charge_card_id : null],
        defaultVendor: [that.generalMappings ? that.generalMappings.default_ccc_vendor_id : null],
        defaultItem: [that.generalMappings ? that.generalMappings.default_item_id : null],
        department: [that.generalMappings ? that.generalMappings.default_department_id : null],
        project: [that.generalMappings ? that.generalMappings.default_project_id : null],
        paymentAccount: [that.generalMappings ? that.generalMappings.payment_account_id : null]
      });
    });
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = +that.route.parent.snapshot.params.workspace_id;
    that.isLoading = true;
    that.mappingsService.getGeneralMappings().subscribe(res => {
      that.generalMappings = res;
      that.reset();
    }, (error) => {
      that.reset();
    });
  }
}
