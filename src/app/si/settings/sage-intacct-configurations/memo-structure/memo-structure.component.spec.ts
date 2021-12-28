import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoStructureComponent } from './memo-structure.component';

describe('CustomizedMemoComponent', () => {
  let component: MemoStructureComponent;
  let fixture: ComponentFixture<MemoStructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemoStructureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
