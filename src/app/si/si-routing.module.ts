import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SiComponent } from './si.component';
import { AuthGuard } from '../core/guard/auth.guard';
import { WorkspacesGuard } from '../core/guard/workspaces.guard';
import { ExportGuard } from '../core/guard/export.guard';
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
import { GeneralMappingsComponent } from './settings/general-mappings/general-mappings.component';
import { ConnectSageIntacctComponent } from './settings/connect-sage-intacct/connect-sage-intacct';
import { EmployeeMappingsComponent } from './settings/employee-mappings/employee-mappings.component';
import { CategoryMappingsComponent } from './settings/category-mappings/category-mappings.component';
import { ScheduleComponent } from './settings/schedule/schedule.component';
import { ConfigurationComponent } from './settings/sage-intacct-configurations/configuration/configuration.component';
import { ExpenseFieldConfigurationComponent } from './settings/sage-intacct-configurations/expense-field-configuration/expense-field-configuration.component';
import { GenericMappingsComponent } from './settings/generic-mappings/generic-mappings.component';
import { SageIntacctConfigurationsComponent } from './settings/sage-intacct-configurations/sage-intacct-configurations.component';
import { MemoStructureComponent } from './settings/sage-intacct-configurations/memo-structure/memo-structure.component';
import { LocationEntityComponent } from './settings/sage-intacct-configurations/location-entity/location-entity.component';
import { SkipExportComponent } from './settings/sage-intacct-configurations/skip-export/skip-export.component';

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
      canActivate: [ExportGuard],
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
          component: SageIntacctConfigurationsComponent,
          children: [
            {
              path: 'general',
              component: ConfigurationComponent
            },
            {
              path: 'location_entity',
              component: LocationEntityComponent
            },
            {
              path: 'expense_fields',
              component: ExpenseFieldConfigurationComponent
            },
            {
              path: 'memo_structure',
              component: MemoStructureComponent
            },
            {
              path: 'skip_export',
              component: SkipExportComponent
            }
          ]
        },
        {
          path: 'general/mappings',
          component: GeneralMappingsComponent,
          canActivate: [WorkspacesGuard]
        },
        {
          path: 'connect_sage_intacct',
          component: ConnectSageIntacctComponent
        },
        {
          path: 'employee/mappings',
          component: EmployeeMappingsComponent,
          canActivate: [ExportGuard]
        },
        {
          path: 'category/mappings',
          component: CategoryMappingsComponent,
          canActivate: [ExportGuard]
        },
        {
          path: ':source_field/mappings',
          component: GenericMappingsComponent,
          canActivate: [ExportGuard]
        },
        {
          path: 'schedule',
          component: ScheduleComponent,
          canActivate: [ExportGuard]
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
