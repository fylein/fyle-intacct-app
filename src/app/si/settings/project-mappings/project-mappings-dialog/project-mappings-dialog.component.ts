import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective, NgForm, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
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
  selector: 'app-project-mappings-dialog',
  templateUrl: './project-mappings-dialog.component.html',
  styleUrls: ['./project-mappings-dialog.component.scss', '../../settings.component.scss']
})
export class ProjectMappingsDialogComponent implements OnInit {
  isLoading = false;
  form: FormGroup;
  fyleProjects: any[];
  sageIntacctLocations: any[];
  sageIntacctDepartments: any[];
  sageIntacctProjects: any[];
  fyleProjectOptions: any[];
  sageIntacctDepartmentOptions: any[];
  sageIntacctProjectOptions: any[];
  sageIntacctLocationOptions: any[];
  generalSettings: any;
  matcher = new MappingErrorStateMatcher();

  constructor(private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<ProjectMappingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private mappingsService: MappingsService,
              private settingsService: SettingsService,
              private snackBar: MatSnackBar) { }

  mappingDisplay(mappingObject) {
    return mappingObject ? mappingObject.value : '';
  }

  forbiddenSelectionValidator(options: any[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
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

  submit() {
    const that = this;

    const fyleProject = that.form.value.fyleProject;
    const sageIntacctLocation = that.generalSettings.project_field_mapping === 'LOCATION' ? that.form.value.sageIntacctLocation : '';
    const sageIntacctDepartment = that.generalSettings.project_field_mapping === 'DEPARTMENT' ? that.form.value.sageIntacctDepartment : '';
    const sageIntacctProject = that.generalSettings.project_field_mapping === 'PROJECT' ? that.form.value.sageIntacctProject : '';

    let destination_value;
    if (that.generalSettings.project_field_mapping === 'LOCATION') {
      destination_value = sageIntacctLocation.value;
    } else if (that.generalSettings.project_field_mapping === 'DEPARTMENT') {
      destination_value = sageIntacctDepartment.value;
    } else if (that.generalSettings.project_field_mapping === 'PROJECT') {
      destination_value = sageIntacctProject.value;
    }

    if (that.form.valid && (sageIntacctLocation || sageIntacctDepartment || sageIntacctProject)) {
      that.isLoading = true;
      that.mappingsService.postMappings({
        source_type: 'PROJECT',
        destination_type: that.generalSettings.project_field_mapping,
        source_value: fyleProject.value,
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

  setupProjectAutocompleteWatcher() {
    const that = this;
    that.form.controls.fyleProject.valueChanges.pipe(debounceTime(300)).subscribe((newValue) => {
      if (typeof (newValue) === 'string') {
        that.fyleProjectOptions = that.fyleProjects.filter(fyleProject => new RegExp(newValue.toLowerCase(), 'g').test(fyleProject.value.toLowerCase()));
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

  setupAutcompleteWatchers() {
    const that = this;
    that.setupProjectAutocompleteWatcher();
    that.setupSageIntacctDepartmentAutocompleteWatcher();
    that.setupSageIntacctLocationAutocompleteWatcher();
    that.setupSageIntacctProjectAutocompleteWatcher();
  }

  reset() {
    const that = this;
    // TODO: remove promises and do with rxjs observables
    const getFyleProjects = that.mappingsService.getFyleProjects().toPromise().then(projects => {
      that.fyleProjects = projects;
    });

    let getSageIntacctEquivalent;
    if (that.generalSettings.project_field_mapping === 'DEPARTMENT') {
      // TODO: remove promises and do with rxjs observables
      getSageIntacctEquivalent = that.mappingsService.getSageIntacctDepartments().toPromise().then(objects => {
        that.sageIntacctDepartments = objects;
      });
    } else if (that.generalSettings.project_field_mapping === 'LOCATION') {
      getSageIntacctEquivalent = that.mappingsService.getSageIntacctLocations().toPromise().then(objects => {
        that.sageIntacctLocations = objects;
      });
    } else if (that.generalSettings.project_field_mapping === 'PROJECT') {
      getSageIntacctEquivalent = that.mappingsService.getSageIntacctProjects().toPromise().then(objects => {
        that.sageIntacctProjects = objects;
      });
    }

    that.isLoading = true;
    forkJoin([
      getFyleProjects,
      getSageIntacctEquivalent
    ]).subscribe(() => {
      that.isLoading = false;
      that.form = that.formBuilder.group({
        fyleProject: ['', Validators.compose([Validators.required, that.forbiddenSelectionValidator(that.fyleProjects)])],
        sageIntacctLocation: ['', that.generalSettings.project_field_mapping === 'LOCATION' ? that.forbiddenSelectionValidator(that.sageIntacctLocations) : null],
        sageIntacctDepartment: ['', that.generalSettings.project_field_mapping === 'DEPARTMENT' ? that.forbiddenSelectionValidator(that.sageIntacctDepartments) : null],
        sageIntacctProject: ['', that.generalSettings.project_field_mapping === 'PROJECT' ? that.forbiddenSelectionValidator(that.sageIntacctProjects) : null]
      });

      that.setupAutcompleteWatchers();
    });
  }

  ngOnInit() {
    const that = this;

    that.isLoading = true;
    that.settingsService.getCombinedSettings(that.data.workspaceId).subscribe(settings => {
      that.generalSettings = settings;
      that.isLoading = false;
      that.reset();
    });
  }
}
