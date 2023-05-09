import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
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
import { SnakeCaseToSpaceCase } from './pipes/snake-case-to-space-case.pipe';
import { MatChipsModule, MAT_CHIPS_DEFAULT_OPTIONS } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatIconModule, MAT_DATE_LOCALE } from '@angular/material';


@NgModule({
  declarations: [
    LoaderComponent,
    ZeroStateComponent,
    MandatoryFieldComponent,
    MandatoryErrorMessageComponent,
    SimpleSearchSelectComponent,
    SearchPipe,
    SnakeCaseToSpaceCase
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule
  ],
  exports: [
    LoaderComponent,
    ZeroStateComponent,
    MandatoryFieldComponent,
    MandatoryErrorMessageComponent,
    SimpleSearchSelectComponent,
    SearchPipe,
    SnakeCaseToSpaceCase,
    MatChipsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [ENTER, COMMA]
      }
    },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]
})
export class SharedModule { }
