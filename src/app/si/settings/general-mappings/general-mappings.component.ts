import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MappingsService } from '../../../core/services/mappings.service';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(
    private route: ActivatedRoute,
    private mappingsService: MappingsService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar) {
  }

  mappingDisplay(mappingObject) {
    return mappingObject ? mappingObject.value : '';
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

    const mapping = {
      default_location_name: defaultLocationName ? defaultLocationName : '',
      default_location_id: that.form.value.location ? that.form.value.location : '',
      default_department_name: defaultDepartmentName ? defaultDepartmentName : '',
      default_department_id: that.form.value.department ? that.form.value.department : '',
      default_project_name: defaultProjectName ? defaultProjectName : '',
      default_project_id: that.form.value.project ? that.form.value.project : ''
    };

    that.mappingsService.postGeneralMappings(mapping).subscribe(response => {
      that.isLoading = false;
      that.snackBar.open('General mappings saved successfully');
      that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
    });
  }


  reset() {
    const that = this;
    that.isLoading = true;

    const getSageIntacctLocations = that.mappingsService.getSageIntacctLocations().toPromise().then(objects => {
      that.sageIntacctLocations = objects;
    });

    const getSageIntacctDepartments = that.mappingsService.getSageIntacctDepartments().toPromise().then(objects => {
      that.sageIntacctDepartments = objects;
    });

    const getSageIntacctProjects = that.mappingsService.getSageIntacctProjects().toPromise().then(objects => {
      that.sageIntacctProjects = objects;
    });

    forkJoin(
      [
        getSageIntacctLocations,
        getSageIntacctDepartments,
        getSageIntacctProjects
      ]
    ).subscribe(responses => {
      that.isLoading = false;
      let locationId;
      let departmentId;
      let projectId;

      if (that.generalMappings) {
        locationId = that.generalMappings.default_location_id ? that.generalMappings.default_location_id : null;
        departmentId = that.generalMappings.default_department_id ? that.generalMappings.default_department_id : null;
        projectId = that.generalMappings.default_project_id ? that.generalMappings.default_project_id : null;
      }

      that.form = that.formBuilder.group({
        location: [locationId ? locationId : ''],
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
