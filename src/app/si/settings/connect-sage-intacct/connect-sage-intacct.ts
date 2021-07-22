import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SiComponent } from '../../si.component';

@Component({
  selector: 'app-connect-sage-intacct',
  templateUrl: './connect-sage-intacct.component.html',
  styleUrls: ['./connect-sage-intacct.component.scss', '../../si.component.scss']
})
export class ConnectSageIntacctComponent implements OnInit {

  isLoading: boolean;
  isSaveDisabled: boolean;
  connectSageIntacctForm: FormGroup;
  workspaceId: number;

  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private si: SiComponent) { }

  save() {
    const that = this;
    const userID = this.connectSageIntacctForm.value.userID;
    const companyID = this.connectSageIntacctForm.value.companyID;
    const companyName = this.connectSageIntacctForm.value.companyName;
    const userPassword = this.connectSageIntacctForm.value.userPassword;

    that.isLoading = true;
    that.settingsService.connectSageIntacct(that.workspaceId, {
      si_user_id: userID,
      si_company_id: companyID,
      si_company_name: companyName,
      si_user_password: userPassword
    }).subscribe(() => {
      that.snackBar.open('Sage Intacct account connected successfully');
      that.isLoading = false;
      that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
      that.si.getSageIntacctCompanyName();
    }, () => {
      that.snackBar.open('Wrong credentials, please try again');
      that.isLoading = false;
    });
  }

  ngOnInit() {
    const that = this;
    that.isSaveDisabled = false;
    that.workspaceId = that.route.snapshot.parent.params.workspace_id;
    that.isLoading = true;
    that.settingsService.getSageIntacctCredentials(that.workspaceId).subscribe((res) => {
      that.connectSageIntacctForm = that.formBuilder.group({
        userID: res.si_user_id ? res.si_user_id : '',
        companyID: res.si_company_id ? res.si_company_id : '',
        companyName: res.si_company_name ? res.si_company_name : '',
        userPassword: ''
      });
      that.isLoading = false;
    }, () => {
      that.isLoading = false;
      that.connectSageIntacctForm = that.formBuilder.group({
        userID: ['', Validators.required],
        companyID: ['', Validators.required],
        companyName: ['', Validators.required],
        userPassword: ['', Validators.required]
      });
    });
  }

}
