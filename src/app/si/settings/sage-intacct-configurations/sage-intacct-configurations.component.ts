import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/core/services/settings.service';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ExpenseField } from 'src/app/core/models/expense-field.model';
import { Configuration } from 'src/app/core/models/configuration.model';

@Component({
  selector: 'app-sage-intacct-configurations',
  templateUrl: './sage-intacct-configurations.component.html',
  styleUrls: ['./sage-intacct-configurations.component.scss', '../../si.component.scss']
})
export class SageIntacctConfigurationsComponent implements OnInit {

  state: string;
  workspaceId: number;
  isParentLoading: boolean;
  fyleFields: ExpenseField[];
  configuration: Configuration;
  sageIntacctConnectionDone: boolean;

  constructor(private route: ActivatedRoute, private router: Router, private mappingsService: MappingsService, private settingsService: SettingsService) { }

  changeState(state) {
    const that = this;
    if (that.state === 'GENERAL') {
      that.state = state;
      that.router.navigate([`workspaces/${that.workspaceId}/settings/configurations/${that.state.toLowerCase()}`]);
    }
    if (that.state === 'EXPENSE_FIELDS') {
      that.state = state;
      that.router.navigate([`workspaces/${that.workspaceId}/settings/configurations/${that.state.toLowerCase()}`]);
    }
    if (that.state === 'MEMO_STRUCTURE') {
      that.state = state;
      that.router.navigate([`workspaces/${that.workspaceId}/settings/configurations/${that.state.toLowerCase()}`]);
    }
    if (that.state === 'LOCATION_ENTITY') {
      that.state = state;
      that.router.navigate([`workspaces/${that.workspaceId}/settings/configurations/${that.state.toLowerCase()}`]);
    }
  }

  showExpenseFields() {
    const that = this;

    if (that.fyleFields && that.fyleFields.length && that.configuration) {
      return true;
    }

    return false;
  }

  ngOnInit() {
    const that = this;
    that.isParentLoading = true;

    that.workspaceId = +that.route.parent.snapshot.params.workspace_id;
    that.state = that.route.snapshot.firstChild.routeConfig.path.toUpperCase() || 'LOCATION_ENTITY';

    that.settingsService.getSageIntacctCredentials(that.workspaceId).subscribe(() => {
      that.sageIntacctConnectionDone = true;
      forkJoin(
        [
          that.mappingsService.getFyleFields(),
          that.settingsService.getConfiguration(that.workspaceId),
        ]
      ).subscribe(response => {
        that.fyleFields = response[0];
        that.configuration = response[1];
        that.isParentLoading = false;
      }, () => {
        that.isParentLoading = false;
      });

    });
  }
}
