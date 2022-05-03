import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SettingsService } from 'src/app/core/services/settings.service';
import { WorkspaceService } from 'src/app/core/services/workspace.service';

@Component({
  selector: 'app-add-email-dialog',
  templateUrl: './add-email-dialog.component.html',
  styleUrls: ['./add-email-dialog.component.scss', '../../settings.component.scss']
})
export class AddEmailDialogComponent implements OnInit {

  form: FormGroup;
  isLoading: boolean;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddEmailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private settingsService: SettingsService
  ) { }

  submit() {
    const that = this;
    that.isLoading = true;

    const adminData = {
      name: that.form.value.adminName,
      email: that.form.value.adminEmail
    };

    if (that.data.selectedEmails) {
      that.data.selectedEmails = [that.form.value.adminEmail, ...that.data.selectedEmails];
    } else {
      that.data.selectedEmails = [that.form.value.adminEmail];
    }

    that.settingsService.postScheduleSettings(that.data.hours, that.data.schedulEnabled, that.data.selectedEmails, adminData).subscribe(() => {
      that.isLoading = false;
      that.dialogRef.close();
    });

  }

  ngOnInit() {
    const that = this;
    that.form = that.formBuilder.group({
      adminName: ['', Validators.required],
      adminEmail: ['', Validators.compose([Validators.email, Validators.required])]
    });
  }

}
