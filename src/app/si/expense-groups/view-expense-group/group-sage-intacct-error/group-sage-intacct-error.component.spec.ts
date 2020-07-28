import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSageIntacctErrorComponent } from './group-sage-intacct-error.component';

describe('GroupMappingErrorComponent', () => {
  let component: GroupSageIntacctErrorComponent;
  let fixture: ComponentFixture<GroupSageIntacctErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupSageIntacctErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSageIntacctErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
