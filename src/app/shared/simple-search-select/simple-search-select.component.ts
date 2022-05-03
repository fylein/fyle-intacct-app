import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-simple-search-select',
  templateUrl: './simple-search-select.component.html',
  styleUrls: ['./simple-search-select.component.scss']
})
export class SimpleSearchSelectComponent implements OnInit {

  @Input() form: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

}
