import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SiComponent } from './si.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { WorkspacesGuard } from '../core/guard/workspaces.guard';
import { ExpenseGroupsComponent } from './expense-groups/expense-groups.component';
import { ViewExpenseGroupComponent } from './expense-groups/view-expense-group/view-expense-group.component';
import { SettingsComponent } from './settings/settings.component';
import { FyleCallbackComponent } from './settings/fyle-callback/fyle-callback.component';
import { InfoComponent } from './expense-groups/view-expense-group/info/info.component';
import { GroupMappingErrorComponent } from './expense-groups/view-expense-group/group-mapping-error/group-mapping-error.component';
import { GroupSageIntacctErrorComponent } from './expense-groups/view-expense-group/group-sage-intacct-error/group-sage-intacct-error.component';
import { SyncExportComponent } from './sync-export/sync-export.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SyncComponent } from './sync-export/sync/sync.component';
import { ExportComponent } from './sync-export/export/export.component';
import { ConfigurationComponent } from './settings/configuration/configuration.component';
import { GeneralMappingsComponent } from './settings/general-mappings/general-mappings.component';
import { ConnectSageIntacctComponent } from './settings/connect-sage-intacct/connect-sage-intacct';
import { EmployeeMappingsComponent } from './settings/employee-mappings/employee-mappings.component';
import { CategoryMappingsComponent } from './settings/category-mappings/category-mappings.component';
import { ProjectMappingsComponent } from './settings/project-mappings/project-mappings.component';
import { CostCenterMappingsComponent } from './settings/cost-center-mappings/cost-center-mappings.component';

const routes: Routes = [{
  path: '',
  component: SiComponent,
  canActivate: [AuthGuard],
  children: [
    {
      path: ':workspace_id/expense_groups',
      component: ExpenseGroupsComponent,
      canActivate: [WorkspacesGuard]
    },
    {
      path: ':workspace_id/dashboard',
      component: DashboardComponent
    },
    {
      path: ':workspace_id/sync_export',
      component: SyncExportComponent,
      canActivate: [WorkspacesGuard],
      children: [
        {
          path: 'sync',
          component: SyncComponent
        },
        {
          path: 'export',
          component: ExportComponent
        }
      ]
    },
    {
      path: ':workspace_id/expense_groups/:expense_group_id/view',
      component: ViewExpenseGroupComponent,
      canActivate: [WorkspacesGuard],
      children: [
        {
          path: 'info',
          component: InfoComponent
        },
        {
          path: 'mapping_errors',
          component: GroupMappingErrorComponent
        },
        {
          path: 'sage_intacct_errors',
          component: GroupSageIntacctErrorComponent
        },
        {
          path: '**',
          redirectTo: 'info'
        }
      ]
    },
    {
      path: ':workspace_id/settings',
      component: SettingsComponent,
      children: [
        {
          path: 'configurations',
          component: ConfigurationComponent
        },
        {
          path: 'general_mappings',
          component: GeneralMappingsComponent,
          canActivate: [WorkspacesGuard]
        },
        {
          path: 'connect_sage_intacct',
          component: ConnectSageIntacctComponent
        },
        {
          path: 'employee_mappings',
          component: EmployeeMappingsComponent,
          canActivate: [WorkspacesGuard]
        },
        {
          path: 'category_mappings',
          component: CategoryMappingsComponent,
          canActivate: [WorkspacesGuard]
        },
        {
          path: 'project_mappings',
          component: ProjectMappingsComponent,
          canActivate: [WorkspacesGuard]
        },
        {
          path: 'cost_center_mappings',
          component: CostCenterMappingsComponent,
          canActivate: [WorkspacesGuard]
        }
      ]
    },
    {
      path: 'fyle/callback',
      component: FyleCallbackComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SiRoutingModule { }
