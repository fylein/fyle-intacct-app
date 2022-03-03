import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationEntityMapping } from 'src/app/core/models/location-entity-mapping.model';
import { MappingDestination } from 'src/app/core/models/mapping-destination.model';
import { MappingsService } from 'src/app/core/services/mappings.service';

@Component({
  selector: 'app-location-entity',
  templateUrl: './location-entity.component.html',
  styleUrls: ['./location-entity.component.scss', '../../../si.component.scss']
})

export class LocationEntityComponent implements OnInit {

  locationEntityForm: FormGroup;
  workspaceId: number;
  siLocationEntities: MappingDestination[];
  isLoading: boolean;
  locationEntityMappings: LocationEntityMapping;
  locationEntityMappingDone = false;

  constructor(private formBuilder: FormBuilder,
              private mappingsService: MappingsService,
              private route: ActivatedRoute,
              private router: Router) {}

  submit() {
    const that = this;

    const locationEntityId = that.locationEntityForm.value.siLocationEntities;

    let locationEntityMappingPayload;

    if (that.locationEntityForm.value.siLocationEntities !== 'top_level') {
      const siEntityMapping = that.siLocationEntities.filter(filteredLocationEntity => filteredLocationEntity.destination_id === locationEntityId)[0];
      locationEntityMappingPayload = {
        location_entity_name: siEntityMapping.value,
        destination_id: siEntityMapping.destination_id,
        country_name: siEntityMapping.detail.country,
        workspace: that.workspaceId
      };
    } else {
      locationEntityMappingPayload = {
        location_entity_name: 'Top Level',
        destination_id: 'top_level',
        country_name: null,
        workspace: that.workspaceId
      };
    }
    that.isLoading = true;

    that.mappingsService.postLocationEntityMapping(locationEntityMappingPayload).subscribe(() => {
      that.router.navigateByUrl(`workspaces/${that.workspaceId}/dashboard`);
    });
  }

  getlocationEntityMappings() {
    const that = this;
    that.mappingsService.getLocationEntityMapping().subscribe(locationEntityMappings => {
      that.isLoading = false;
      that.locationEntityMappings = locationEntityMappings;
      that.locationEntityMappingDone = true;
      that.locationEntityForm = that.formBuilder.group({
        siLocationEntities: [that.locationEntityMappings ? that.locationEntityMappings.destination_id : '']
      });
      that.locationEntityForm.controls.siLocationEntities.disable();
    }, () => {
      that.isLoading = false;
      that.locationEntityForm = that.formBuilder.group({
        siLocationEntities: ['', Validators.required]
      });
    });
  }

  ngOnInit() {
    const that = this;
    that.workspaceId = that.route.snapshot.parent.parent.params.workspace_id;
    that.isLoading = true;
    that.mappingsService.getSageIntacctDestinationAttributes('LOCATION_ENTITY').subscribe((locationEntities) => {
      that.siLocationEntities = locationEntities.filter(entity => (entity.detail && entity.detail.country));

      that.getlocationEntityMappings();
    });
  }
}
