import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from 'src/app/core/services/settings.service';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { WindowReferenceService } from 'src/app/core/services/window.service';
import { SiComponent } from 'src/app/si/si.component';
import { MappingSetting } from 'src/app/core/models/mapping-setting.model';
import { ExpenseField } from 'src/app/core/models/expense-field.model';
import { MatSnackBar } from '@angular/material';
import { MappingSettingResponse } from 'src/app/core/models/mapping-setting-response.model';

@Component({
  selector: 'app-dependent-expense-field-configuration',
  templateUrl: './dependent-expense-field-configuration.component.html',
  styleUrls: ['./dependent-expense-field-configuration.component.scss']
})
export class DependentExpenseFieldConfigurationComponent implements OnInit {

  dependentExpenseFieldsForm: FormGroup;
  dependentExpenseFields: FormArray;
  dependentCustomFieldForm: FormGroup;
  workspaceId: number;
  fyleDependentExpenseFields: ExpenseField[];
  parentFields: ExpenseField[];
  showDependentCustomFieldName: boolean;
  dependentCustomFieldName = 'Choose Dependent Custom Field'
  isSystemField: boolean;
  showAddButton: boolean;
  showDependentAddButton: boolean;
  windowReference: Window;


  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private settingsService: SettingsService, private mappingsService: MappingsService, private snackBar: MatSnackBar, private si: SiComponent, private windowReferenceService: WindowReferenceService) {
    this.windowReference = this.windowReferenceService.nativeWindow;
  }

  ngOnInit() {
  }

}
