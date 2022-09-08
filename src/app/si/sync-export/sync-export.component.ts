import { MappingsService } from 'src/app/core/services/mappings.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sync-export',
  templateUrl: './sync-export.component.html',
  styleUrls: ['./sync-export.component.scss', '../si.component.scss']
})
export class SyncExportComponent implements OnInit {

  state: string;
  workspaceId: number;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private mappingsService: MappingsService
    ) { }

  changeState(state) {
    const that = this;
    if (that.state !== state) {
      that.state = state;
      that.router.navigate([`workspaces/${that.workspaceId}/sync_export/${that.state.toLowerCase()}`]);
    }
  }

  mappingsCheck() {
    this.mappingsService.getGeneralMappings().subscribe(res => {
    }, () => {
      this.snackBar.open('You cannot access this page yet. Please follow the onboarding steps in the dashboard or refresh your page');
      this.router.navigateByUrl(`workspaces/${this.workspaceId}/dashboard`);
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.state = this.route.snapshot.firstChild.routeConfig.path.toUpperCase() || 'SYNC';
    this.workspaceId = +this.route.snapshot.params.workspace_id;
    this.mappingsCheck()
    this.isLoading = false;
  }

}
