import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostCenterMappingsComponent } from './cost-center-mappings.component';

describe('CostCenterMappingsComponent', () => {
  let component: CostCenterMappingsComponent;
  let fixture: ComponentFixture<CostCenterMappingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostCenterMappingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostCenterMappingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
