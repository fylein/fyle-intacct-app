import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleSearchSelectComponent } from './simple-search-select.component';

describe('SimpleSearchSelectComponent', () => {
  let component: SimpleSearchSelectComponent;
  let fixture: ComponentFixture<SimpleSearchSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleSearchSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleSearchSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
