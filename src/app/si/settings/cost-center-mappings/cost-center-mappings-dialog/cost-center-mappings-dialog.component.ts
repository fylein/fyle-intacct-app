import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective, NgForm, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { forkJoin } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ErrorStateMatcher } from '@angular/material/core';
export class MappingErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-cost-center-mappings-dialog',
  templateUrl: './cost-center-mappings-dialog.component.html',
  styleUrls: ['./cost-center-mappings-dialog.component.scss', '../../settings.component.scss']
})
export class CostCenterMappingsDialogComponent implements OnInit {
  isLoading = false;
  form: FormGroup;
  fyleCostCenters: any[];
  sageIntacctDepartments: any[];
  sageIntacctLocations: any[];
  sageIntacctProjects: any[];
  sageIntacctDepartmentOptions: any[];
  sageIntacctProjectOptions: any[];
  sageIntacctLocationOptions: any[];
  fyleCostCenterOptions: any[];
  qboOptions: any[];
  generalSettings: any;
  matcher = new MappingErrorStateMatcher();

  constructor(private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<CostCenterMappingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private mappingsService: MappingsService,
              private settingsService: SettingsService,
              private snackBar: MatSnackBar) { }

  mappingDisplay(mappingObject) {
    return mappingObject ? mappingObject.value : '';
  }

  submit() {
    const that = this;

    const fyleCostCenter = that.form.value.fyleCostCenter;
    const sageIntacctLocation = that.generalSettings.cost_center_field_mapping === 'LOCATION' ? that.form.value.sageIntacctLocation : '';
    const sageIntacctDepartment = that.generalSettings.cost_center_field_mapping === 'DEPARTMENT' ? that.form.value.sageIntacctDepartment : '';
    const sageIntacctProject = that.generalSettings.cost_center_field_mapping === 'PROJECT' ? that.form.value.sageIntacctProject : '';

    let destination_value;
    if (that.generalSettings.cost_center_field_mapping === 'LOCATION') {
      destination_value = sageIntacctLocation.value;
    } else if (that.generalSettings.cost_center_field_mapping === 'DEPARTMENT') {
      destination_value = sageIntacctDepartment.value;
    } else if (that.generalSettings.cost_center_field_mapping === 'PROJECT') {
      destination_value = sageIntacctProject.value;
    }

    if (that.form.valid && (sageIntacctLocation || sageIntacctDepartment || sageIntacctProject)) {
      that.isLoading = true;
      that.mappingsService.postMappings({
        source_type: 'COST_CENTER',
        destination_type: that.generalSettings.cost_center_field_mapping,
        source_value: fyleCostCenter.value,
        destination_value: destination_value
      }).subscribe(response => {
        that.snackBar.open('Mapping saved successfully');
        that.isLoading = false;
        that.dialogRef.close();
      }, err => {
        that.snackBar.open('Something went wrong');
        that.isLoading = false;
      });
    } else {
      that.snackBar.open('Form has invalid fields');
      that.form.markAllAsTouched();
    }
  }

  forbiddenSelectionValidator(options: any[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const forbidden = !options.some((option) => {
        return control.value.id && option.id === control.value.id;
      });
      return forbidden ? {
        forbiddenOption: {
          value: control.value
        }
      } : null;
    };
  }

  setupCostCenterWatcher() {
    const that = this;

    that.form.controls.fyleCostCenter.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.fyleCostCenterOptions = that.fyleCostCenters
          .filter(fyleCostCenter => new RegExp(newValue.toLowerCase(), 'g').test(fyleCostCenter.value.toLowerCase()));
      }
    });
  }

  setupSageIntacctDepartmentAutocompleteWatcher() {
    const that = this;
    that.form.controls.sageIntacctDepartment.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.sageIntacctDepartmentOptions = that.sageIntacctDepartments
          .filter(siElement => new RegExp(newValue.toLowerCase(), 'g').test(siElement.value.toLowerCase()));
      }
    });
  }

  setupSageIntacctLocationAutocompleteWatcher() {
    const that = this;
    that.form.controls.sageIntacctLocation.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.sageIntacctLocationOptions = that.sageIntacctLocations
          .filter(siElement => new RegExp(newValue.toLowerCase(), 'g').test(siElement.value.toLowerCase()));
      }
    });
  }

  setupSageIntacctProjectAutocompleteWatcher() {
    const that = this;
    that.form.controls.sageIntacctProject.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.sageIntacctProjectOptions = that.sageIntacctProjects
          .filter(siElement => new RegExp(newValue.toLowerCase(), 'g').test(siElement.value.toLowerCase()));
      }
    });
  }

  setupAutcompleteWathcers() {
    const that = this;
    that.setupCostCenterWatcher();
    that.setupSageIntacctDepartmentAutocompleteWatcher();
    that.setupSageIntacctLocationAutocompleteWatcher();
    that.setupSageIntacctProjectAutocompleteWatcher();
  }

  reset() {
    const that = this;
    // TODO: remove promises and do with rxjs observables
    const getFyleCostCenters = that.mappingsService.getFyleCostCenters().toPromise().then(costCenters => {
      that.fyleCostCenters = costCenters;
    });

    let getSageIntacctEquivalent;
    if (this.generalSettings.cost_center_field_mapping === 'DEPARTMENT') {
      // TODO: remove promises and do with rxjs observables
      getSageIntacctEquivalent = that.mappingsService.getSageIntacctDepartments().toPromise().then(objects => {
        that.sageIntacctDepartments = objects;
      });
    } else if (this.generalSettings.cost_center_field_mapping === 'LOCATION') {
      // TODO: remove promises and do with rxjs observables
      getSageIntacctEquivalent = that.mappingsService.getSageIntacctLocations().toPromise().then(objects => {
        that.sageIntacctLocations = objects;
      });
    } else if (this.generalSettings.cost_center_field_mapping === 'PROJECT') {
      getSageIntacctEquivalent = that.mappingsService.getSageIntacctProjects().toPromise().then(objects => {
        that.sageIntacctProjects = objects;
      });
    }

    that.isLoading = true;
    // TODO: remove promises and do with rxjs observables
    forkJoin([
      getFyleCostCenters,
      getSageIntacctEquivalent
    ]).subscribe(() => {
      that.isLoading = false;
      that.form = that.formBuilder.group({
        fyleCostCenter: ['', Validators.compose([Validators.required, that.forbiddenSelectionValidator(that.fyleCostCenters)])],
        sageIntacctLocation: ['', that.generalSettings.cost_center_field_mapping === 'LOCATION' ? that.forbiddenSelectionValidator(that.sageIntacctLocations) : null],
        sageIntacctDepartment: ['', that.generalSettings.cost_center_field_mapping === 'DEPARTMENT' ? that.forbiddenSelectionValidator(that.sageIntacctDepartments) : null],
        sageIntacctProject: ['', that.generalSettings.cost_center_field_mapping === 'PROJECT' ? that.forbiddenSelectionValidator(that.sageIntacctProjects) : null]
      });

      that.setupAutcompleteWathcers();
    });
  }

  ngOnInit() {
    const that = this;
    that.isLoading = true;
    that.settingsService.getCombinedSettings(that.data.workspaceId).subscribe((settings) => {
      that.isLoading = false;
      that.generalSettings = settings;
      that.reset();
    });
  }
}
