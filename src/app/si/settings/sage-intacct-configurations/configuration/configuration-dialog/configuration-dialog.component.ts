import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UpdatedConfiguration } from 'src/app/core/models/updated-configuration';

@Component({
  selector: 'app-configuration-dialog',
  templateUrl: './configuration-dialog.component.html',
  styleUrls: ['./configuration-dialog.component.scss']
})
export class ConfigurationDialogComponent implements OnInit {
  updatedConfiguration: UpdatedConfiguration;
  customStyle: object = {};
  additionalWarning: string;

  constructor(public dialogRef: MatDialogRef<ConfigurationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: UpdatedConfiguration) { }

  redirectToEmployeeMappings(): boolean {
    const that = this;

    if (that.updatedConfiguration.employee && !that.updatedConfiguration.autoCreateDestinationEntity && that.updatedConfiguration.employee.oldValue !== that.updatedConfiguration.employee.newValue) {
      return true;
    }

    return false;
  }

  submit() {
    const that = this;

    that.dialogRef.close({
      redirectToEmployeeMappings: that.redirectToEmployeeMappings(),
      accpetedChanges: true
    });
  }

  setup() {
    const that = this;

    if (that.updatedConfiguration.cccExpense && that.updatedConfiguration.cccExpense.oldValue !== 'CHARGE_CARD_TRANSACTION') {
      that.customStyle = {'margin-right': '10%'};
    }

    if (that.updatedConfiguration.reimburseExpense && that.updatedConfiguration.reimburseExpense.oldValue === 'EXPENSE_REPORT' && that.updatedConfiguration.reimburseExpense.newValue !== 'EXPENSE_REPORT') {
      let exportType = that.updatedConfiguration.reimburseExpense.newValue;
      exportType = exportType.charAt(0).toUpperCase() + exportType.substr(1).toLowerCase();
      that.additionalWarning = `${exportType} would require an GL account for successful export. You can import this by enabling the toggle below or creating a manual map from the Category Mapping section.`;
    }
  }

  getTitle(name: string) {
    return name.replace(/_/g, ' ');
  }

  ngOnInit() {
    const that = this;
    if (that.data.cccExpense) {
      that.data.cccExpense.oldValue = that.getTitle(that.data.cccExpense.oldValue);
      that.data.cccExpense.newValue = that.getTitle(that.data.cccExpense.newValue);
    }

    if (that.data.reimburseExpense) {
      that.data.reimburseExpense.oldValue = that.getTitle(that.data.reimburseExpense.oldValue);
      that.data.reimburseExpense.newValue = that.getTitle(that.data.reimburseExpense.newValue);
    }

    that.updatedConfiguration = that.data;
    that.setup();
  }

}
