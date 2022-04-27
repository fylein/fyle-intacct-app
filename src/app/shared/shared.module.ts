import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader/loader.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ZeroStateComponent } from './zero-state/zero-state.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MandatoryFieldComponent } from './mandatory-field/mandatory-field.component';
import { MandatoryErrorMessageComponent } from './mandatory-error-message/mandatory-error-message.component';
import { SimpleSearchSelectComponent } from './simple-search-select/simple-search-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchPipe } from './pipes/search.pipe';


@NgModule({
  declarations: [
    LoaderComponent,
    ZeroStateComponent,
    MandatoryFieldComponent,
    MandatoryErrorMessageComponent,
    SimpleSearchSelectComponent,
    SearchPipe,
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatButtonModule,
    FormsModule, 
    ReactiveFormsModule
  ],
  exports: [
    LoaderComponent,
    ZeroStateComponent,
    MandatoryFieldComponent,
    MandatoryErrorMessageComponent,
    SimpleSearchSelectComponent,
    SearchPipe,
  ]
})
export class SharedModule { }
