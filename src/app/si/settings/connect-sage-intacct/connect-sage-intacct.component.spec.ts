import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectSageIntacctComponent } from './connect-sage-intacct';

describe('ConnectSageIntacctComponent', () => {
  let component: ConnectSageIntacctComponent;
  let fixture: ComponentFixture<ConnectSageIntacctComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectSageIntacctComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectSageIntacctComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
