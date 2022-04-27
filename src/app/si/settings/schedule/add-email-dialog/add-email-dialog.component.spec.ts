import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEmailDialogComponent } from './add-email-dialog.component';

describe('AddEmailDialogComponent', () => {
  let component: AddEmailDialogComponent;
  let fixture: ComponentFixture<AddEmailDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEmailDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEmailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
