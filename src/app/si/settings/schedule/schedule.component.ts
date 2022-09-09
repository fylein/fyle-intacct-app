import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { pairwise } from 'rxjs/internal/operators/pairwise';
import { ScheduleSettings } from 'src/app/core/models/schedule-setting.model';
import { AddEmailDialogComponent } from './add-email-dialog/add-email-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceService } from 'src/app/core/services/workspace.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss', '../../si.component.scss']
})
export class ScheduleComponent implements OnInit {
  form: FormGroup;
  workspaceId: number;
  isLoading = false;
  hours = [...Array(24).keys()].map(day => day + 1);
  settings: ScheduleSettings;
  workspaceAdmins: string[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    private workspaceService: WorkspaceService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  getSettings() {
    const that = this;
    that.isLoading = true;
    that.settingsService.getScheduleSettings(that.workspaceId).subscribe((settings: ScheduleSettings) => {
      that.settings = settings;
      that.workspaceService.getWorkspaceAdmins().subscribe((admins) => {
        that.workspaceAdmins = admins;
        that.settingsService.getScheduleSettings(this.workspaceId).subscribe((setting) => {
          setting.additional_email_options.forEach(element => {
            that.workspaceAdmins.push(element);
          });
        });
        that.form.setValue({
          hours: settings.interval_hours,
          scheduleEnabled: settings.enabled,
          emails: settings.emails_selected,
          searchOption: ''
        });
        that.isLoading = false;
      });
    }, (error) => {
      that.isLoading = false;
    });
  }

  clearSearchText(event): void {
    const that = this;
    that.form.controls.searchOption.patchValue(null);
  }

  delete(event: Event, email: string, deleteAll: boolean = false) {
    event.preventDefault();
    event.stopPropagation();
    if (deleteAll) {
      this.form.controls.emails.patchValue(null);
    } else {
      const emails = this.form.value.emails.filter(value => value !== email);
      this.form.controls.emails.patchValue(emails);
    }
  }

  open() {
    const that = this;

    const dialogRef = that.dialog.open(AddEmailDialogComponent, {
      width: '467px',
      data: {
        workspaceId: that.workspaceId,
        hours: that.form.value.hours,
        schedulEnabled: that.form.value.scheduleEnabled,
        selectedEmails: that.form.value.emails
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      that.getSettings();
    });
  }

  submit() {
    const that = this;
    const hours = this.form.value.hours;
    const scheduleEnabled = this.form.value.scheduleEnabled;
    const selectedEmails = that.form.value.emails;

    that.isLoading = true;
    that.settingsService.postScheduleSettings(hours, scheduleEnabled, selectedEmails, null).subscribe(response => {
      that.isLoading = false;
      that.snackBar.open('Scheduling saved');
      that.getSettings();
    });
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = +that.route.parent.snapshot.params.workspace_id;
    that.form = that.formBuilder.group({
      hours: ['', Validators.required],
      scheduleEnabled: [false],
      emails: [],
      searchOption: [],
    });

    that.form.controls.scheduleEnabled.valueChanges.pipe(
      distinctUntilChanged(),
      pairwise()
    ).subscribe(([oldValue, newValue]) => {
      if (!newValue && oldValue !== newValue) {
        if (that.settings) {
          that.isLoading = true;
          that.settingsService.postScheduleSettings(0, false, null, null).subscribe(() => {
            that.isLoading = false;
            that.snackBar.open('Scheduling turned off');
            that.getSettings();
          });
        }
      }
    }, () => {
      that.snackBar.open('Something went wrong');
    });

    that.workspaceService.getWorkspaceAdmins().subscribe((admins) => {
      that.workspaceAdmins = admins;
    });

    that.getSettings();
  }

}
