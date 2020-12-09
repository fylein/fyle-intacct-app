import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SageIntacctConfigurationsComponent } from './sage-intacct-configurations.component';

describe('SageIntacctConfigurationsComponent', () => {
  let component: SageIntacctConfigurationsComponent;
  let fixture: ComponentFixture<SageIntacctConfigurationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SageIntacctConfigurationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SageIntacctConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
