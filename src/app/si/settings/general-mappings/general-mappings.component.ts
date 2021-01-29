import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MappingsService } from '../../../core/services/mappings.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from 'src/app/core/services/settings.service';

@Component({
  selector: 'app-general-mappings',
  templateUrl: './general-mappings.component.html',
  styleUrls: ['./general-mappings.component.scss', '../../si.component.scss']
})
export class GeneralMappingsComponent implements OnInit {
  form: FormGroup;
  workspaceId: number;
  generalMappings: any;
  isLoading = true;
  sageIntacctLocations: any[];
  sageIntacctDepartments: any[];
  sageIntacctProjects: any[];
  sageIntacctDefaultVendor: any[];
  sageIntacctDefaultChargeCard: any[];
  sageIntacctDefaultItem: any[];
  generalSettings: any;
  defaultVendor: any[];
  defaultChargeCard: any[];
  defaultItem: any[];

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
    let defaultLocationName;
    if (that.form.value.location) {
      defaultLocationName = that.sageIntacctLocations.filter((element) => element.destination_id === that.form.value.location)[0].value;
    }

    let defaultDepartmentName;
    if (that.form.value.department) {
      defaultDepartmentName = that.sageIntacctDepartments.filter((element) => element.destination_id === that.form.value.department)[0].value;
    }

    let defaultProjectName;
    if (that.form.value.project) {
      defaultProjectName = that.sageIntacctProjects.filter((element) => element.destination_id === that.form.value.project)[0].value;
    }

    let defaultVendor;
    if (that.form.value.defaultVendor) {
      defaultVendor = that.sageIntacctDefaultVendor.filter((element) => element.destination_id === that.form.value.defaultVendor)[0].value;
    }

    let defaultChargeCard;
    if (that.form.value.chargeCard) {
      defaultChargeCard = that.sageIntacctDefaultChargeCard.filter((element) => element.destination_id === that.form.value.chargeCard)[0].value;
    }

    let defaultItem;
    if (that.form.value.defaultItem) {
      defaultItem = that.sageIntacctDefaultItem.filter((element) => element.destination_id === that.form.value.defaultItem)[0].value;
    }

    const mapping = {
      default_location_name: defaultLocationName ? defaultLocationName : '',
      default_location_id: that.form.value.location ? that.form.value.location : '',
      default_department_name: defaultDepartmentName ? defaultDepartmentName : '',
      default_department_id: that.form.value.department ? that.form.value.department : '',
      default_project_name: defaultProjectName ? defaultProjectName : '',
      default_project_id: that.form.value.project ? that.form.value.project : '',
      default_ccc_vendor_name: defaultVendor ? defaultVendor : '',
      default_ccc_vendor_id: that.form.value.defaultVendor ? that.form.value.defaultVendor : '',
      default_charge_card_name: defaultChargeCard ? defaultChargeCard : '',
      default_item_id: that.form.value.defaultItem ? that.form.value.defaultItem : '',
      default_item_name: defaultItem ? defaultItem : '',
      default_charge_card_id: that.form.value.chargeCard ? that.form.value.chargeCard : ''
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

    that.settingsService.getCombinedSettings(that.workspaceId).subscribe(settings => {
      that.generalSettings = settings;
    });

    const getSageIntacctLocations = that.mappingsService.getSageIntacctLocations().toPromise().then(objects => {
      that.sageIntacctLocations = objects;
    });

    const getSageIntacctDepartments = that.mappingsService.getSageIntacctDepartments().toPromise().then(objects => {
      that.sageIntacctDepartments = objects;
    });

    const getSageIntacctProjects = that.mappingsService.getSageIntacctProjects().toPromise().then(objects => {
      that.sageIntacctProjects = objects;
    });

    const getSageIntacctDefaultVendor = that.mappingsService.getSageIntacctVendors().toPromise().then(objects => {
      that.sageIntacctDefaultVendor = objects;
    });

    const getSageIntacctDefaultChargeCard = that.mappingsService.getSageIntacctChargeCard().toPromise().then(objects => {
      that.sageIntacctDefaultChargeCard = objects;
    });

    const getSageIntacctItem = that.mappingsService.getSageIntacctItem().toPromise().then(objects => {
      that.sageIntacctDefaultItem = objects;
    });

    forkJoin(
      [
        getSageIntacctLocations,
        getSageIntacctDepartments,
        getSageIntacctProjects,
        getSageIntacctDefaultVendor,
        getSageIntacctDefaultChargeCard,
        getSageIntacctItem
      ]
    ).subscribe(responses => {
      that.isLoading = false;
      let locationId;
      let departmentId;
      let projectId;
      let chargeCard;
      let defaultVendor;
      let defaultItem;

      if (that.generalMappings) {
        locationId = that.generalMappings.default_location_id ? that.generalMappings.default_location_id : null;
        departmentId = that.generalMappings.default_department_id ? that.generalMappings.default_department_id : null;
        projectId = that.generalMappings.default_project_id ? that.generalMappings.default_project_id : null;
        chargeCard = that.generalMappings.default_charge_card_id ? that.generalMappings.default_charge_card_id : null;
        defaultVendor = that.generalMappings.default_ccc_vendor_id ? that.generalMappings.default_ccc_vendor_id : null;
        defaultItem = that.generalMappings.default_item_id ? that.generalMappings.default_item_id : null;
      }

      that.form = that.formBuilder.group({
        location: [locationId ? locationId : ''],
        chargeCard: [chargeCard ? chargeCard : ''],
        defaultVendor: [defaultVendor ? defaultVendor : ''],
        defaultItem: [defaultItem ? defaultItem : ''],
        department: [departmentId ? departmentId : ''],
        project: [projectId ? projectId : '']
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
