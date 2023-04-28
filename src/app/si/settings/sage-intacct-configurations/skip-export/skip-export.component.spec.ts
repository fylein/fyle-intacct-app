import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkipExportComponent } from './skip-export.component';

describe('SkipExportComponent', () => {
  let component: SkipExportComponent;
  let fixture: ComponentFixture<SkipExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkipExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkipExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
