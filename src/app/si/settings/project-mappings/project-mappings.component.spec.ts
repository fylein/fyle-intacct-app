import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMappingsComponent } from './project-mappings.component';

describe('ProjectMappingsComponent', () => {
  let component: ProjectMappingsComponent;
  let fixture: ComponentFixture<ProjectMappingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectMappingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMappingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
