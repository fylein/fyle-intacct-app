import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMappingsDialogComponent } from './project-mappings-dialog.component';

describe('ProjectMappingsDialogComponent', () => {
  let component: ProjectMappingsDialogComponent;
  let fixture: ComponentFixture<ProjectMappingsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectMappingsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMappingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
