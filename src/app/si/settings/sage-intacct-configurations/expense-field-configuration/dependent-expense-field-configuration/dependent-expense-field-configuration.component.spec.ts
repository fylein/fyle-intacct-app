import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DependentExpenseFieldConfigurationComponent } from './dependent-expense-field-configuration.component';

describe('DependentExpenseFieldConfigurationComponent', () => {
  let component: DependentExpenseFieldConfigurationComponent;
  let fixture: ComponentFixture<DependentExpenseFieldConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DependentExpenseFieldConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DependentExpenseFieldConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
