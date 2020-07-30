import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostCenterMappingsDialogComponent } from './cost-center-mappings-dialog.component';

describe('CostCenterMappingsDialogComponent', () => {
  let component: CostCenterMappingsDialogComponent;
  let fixture: ComponentFixture<CostCenterMappingsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostCenterMappingsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostCenterMappingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
