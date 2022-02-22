import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MappingDestination } from 'src/app/core/models/mapping-destination.model';
import { MappingsService } from 'src/app/core/services/mappings.service';
import { SettingsService } from 'src/app/core/services/settings.service';

@Component({
  selector: 'app-location-entity',
  templateUrl: './location-entity.component.html',
  styleUrls: ['./location-entity.component.scss']
})

export class LocationEntityComponent implements OnInit {

  subsidiaryForm: FormGroup;
  workspaceId: number;
  netsuiteSubsidiaries: MappingDestination[];
  isLoading: boolean;
  subsidiaryMappings: any;
  subsidiaryMappingDone = false;

  constructor(private formBuilder: FormBuilder,
              private settingsService: SettingsService,
              private mappingsService: MappingsService,
              private route: ActivatedRoute,
              private router: Router) {}

  submit() {
    const that = this;

    const subsidiaryId = that.subsidiaryForm.value.netsuiteSubsidiaries;
    const netsuiteSubsidiary = that.netsuiteSubsidiaries.filter(filteredSubsidiary => filteredSubsidiary.destination_id === subsidiaryId)[0];
    that.isLoading = true;

    const subsidiaryMappingPayload: any = {
      location_entity_name: netsuiteSubsidiary.value,
      destination_id: netsuiteSubsidiary.destination_id,
      country_name: 'us',
      workspace: that.workspaceId
    };

    that.mappingsService.postSubsidiaryMappings(subsidiaryMappingPayload).subscribe(() => {
      that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
    });
  }

  getSubsidiaryMappings() {
    const that = this;
    that.mappingsService.getLocationEntityMapping().subscribe(subsidiaryMappings => {
      that.isLoading = false;
      that.subsidiaryMappings = subsidiaryMappings;
      that.subsidiaryMappingDone = true;
      that.subsidiaryForm = that.formBuilder.group({
        netsuiteSubsidiaries: [that.subsidiaryMappings ? that.subsidiaryMappings.destination_id : '']
      });
      that.subsidiaryForm.controls.netsuiteSubsidiaries.disable();
    }, () => {
      that.isLoading = false;
      that.subsidiaryForm = that.formBuilder.group({
        netsuiteSubsidiaries: ['', Validators.required]
      });
    });
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = that.route.snapshot.parent.parent.params.workspace_id;
    that.isLoading = true;
    that.mappingsService.getSageIntacctDestinationAttributes('LOCATION_ENTITY').subscribe((subsidiaries) => {
      that.netsuiteSubsidiaries = subsidiaries;
      that.getSubsidiaryMappings();
    });
  }

}