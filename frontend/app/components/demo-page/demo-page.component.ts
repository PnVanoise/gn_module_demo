import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { ActivatedRoute } from '@angular/router';

import { Demo } from '../../models/demo';
import { DemoComponent } from '../demo/demo.component';
import { DemoService } from '../../services/demo.service';

@Component({
  standalone: true,
  templateUrl: 'demo-page.component.html',
  styleUrls: ['./demo-page.component.scss'],
  imports: [
    GN2CommonModule,
    CommonModule,
    DemoComponent
  ],
})
export class DemoPageComponent implements OnInit {
  demo: Demo | null = null;

  constructor(
    private _demoService: DemoService,
    private _route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this._route.params.subscribe((params: any) => {
      this._demoService.getDemo(params["id_demo"])
      .subscribe((response: Demo) => {
        this.demo = response;
      });
    });
  }
}
