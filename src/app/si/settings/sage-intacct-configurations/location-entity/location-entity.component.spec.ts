import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationEntityComponent } from './location-entity.component';

describe('LocationEntityComponent', () => {
  let component: LocationEntityComponent;
  let fixture: ComponentFixture<LocationEntityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationEntityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
