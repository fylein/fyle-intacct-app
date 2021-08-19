import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ZeroStateComponent } from './zero-state/zero-state.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MandatoryFieldComponent } from './mandatory-field/mandatory-field.component';
import { MandatoryErrorMessageComponent } from './mandatory-error-message/mandatory-error-message.component';



@NgModule({
  declarations: [
    LoaderComponent,
    ZeroStateComponent,
    MandatoryFieldComponent,
    MandatoryErrorMessageComponent
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatButtonModule
  ],
  exports: [
    LoaderComponent,
    ZeroStateComponent,
    MandatoryFieldComponent,
    MandatoryErrorMessageComponent
  ]
})
export class SharedModule { }
