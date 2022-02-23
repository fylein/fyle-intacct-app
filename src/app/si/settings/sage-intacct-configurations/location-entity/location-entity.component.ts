import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  locationEntityMappings: any;
  locationEntityMappingDone = false;

  constructor(private formBuilder: FormBuilder,
              private mappingsService: MappingsService,
              private route: ActivatedRoute,
              private router: Router) {}

  submit() {
    const that = this;

    const locationEntityId = that.locationEntityForm.value.siLocationEntities;
    const siEntityMapping = that.siLocationEntities.filter(filteredLocationEntity => filteredLocationEntity.destination_id === locationEntityId)[0];
    that.isLoading = true;

    const locationEntityMappingPayload: any = {
      location_entity_name: siEntityMapping.value,
      destination_id: siEntityMapping.destination_id,
      country_name: siEntityMapping.detail.country,
      workspace: that.workspaceId
    };

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
      that.siLocationEntities = locationEntities.filter(entity => entity.detail.country !== null);
      that.getlocationEntityMappings();
    });
  }
}
