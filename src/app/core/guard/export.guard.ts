import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SettingsService } from '../services/settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from '../services/storage.service';
import { WorkspaceService } from '../services/workspace.service';
import { MappingsService } from 'src/app/core/services/mappings.service';

@Injectable({
  providedIn: 'root'
})
export class ExportGuard implements CanActivate {

  constructor(
    private settingsService: SettingsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private workspaceService: WorkspaceService,
    private mappingsService: MappingsService,
    ) { }

  canActivate(next: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const workspaceId = +this.workspaceService.getWorkspaceId();

    if (!workspaceId) {
      return this.router.navigateByUrl(`workspaces/${workspaceId}/dashboard`);
    }

    return forkJoin(
      [
        this.settingsService.getFyleCredentials(workspaceId),
        this.settingsService.getSageIntacctCredentials(workspaceId),
        this.settingsService.getConfiguration(workspaceId),
        this.mappingsService.getGeneralMappings()
      ]
    ).pipe(
      map(response => !!response),
      catchError(error => {
        const that = this;
        return that.router.navigateByUrl(`workspaces/${workspaceId}/dashboard`).then((res) => {
          that.snackBar.open('You cannot access this page yet. Please follow the onboarding steps in the dashboard');
          return res;
        });
      })
    );
  }
}
