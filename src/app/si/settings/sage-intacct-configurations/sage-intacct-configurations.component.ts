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
  isParentLoading = true;
  fyleFields: ExpenseField[];
  configuration: Configuration;
  sageIntacctConnectionDone: boolean;

  constructor(private route: ActivatedRoute, private router: Router, private mappingsService: MappingsService, private settingsService: SettingsService) { }

  changeState(state: string) {
    const that = this;
    that.state = state;
    that.router.navigate([`workspaces/${that.workspaceId}/settings/configurations/${that.state.toLowerCase()}`]);
  }

  showExpenseFields() {
    const that = this;

    if (that.fyleFields && that.fyleFields.length && that.configuration) {
      return true;
    }

    return false;
  }

  reset() {
    const that = this;
    that.mappingsService.getLocationEntityMapping().subscribe(() => {
      that.state = that.route.snapshot.firstChild ? that.route.snapshot.firstChild.routeConfig.path.toUpperCase() || 'GENERAL' : 'GENERAL';
      forkJoin(
        [
          that.mappingsService.getFyleFields(),
          that.settingsService.getConfiguration(that.workspaceId)
        ]
      ).subscribe(result => {
        that.fyleFields = result[0];
        that.configuration = result[1];
        that.changeState(that.state);
        that.isParentLoading = false;
      }, () => {
        that.changeState(that.state);
        that.isParentLoading = false;
      });

    }, () => {
      that.state = that.route.snapshot.firstChild ? that.route.snapshot.firstChild.routeConfig.path.toUpperCase() || 'LOCATION_ENTITY' : 'LOCATION_ENTITY';
      that.changeState(that.state);
      that.isParentLoading = false;
    });
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = +that.route.parent.snapshot.params.workspace_id;

    that.reset();
  }
}
