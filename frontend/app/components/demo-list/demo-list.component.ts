import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { RouterModule } from '@angular/router';

import { Demo } from '../../models/demo';
import { DemoComponent } from '../demo/demo.component';
import { DemoService } from '../../services/demo.service';

@Component({
  standalone: true,
  templateUrl: 'demo-list.component.html',
  styleUrls: ['./demo-list.component.scss'],
  imports: [
    GN2CommonModule,
    CommonModule,
    RouterModule,
    DemoComponent
  ],
})
export class DemoListComponent implements OnInit {
  demos: Demo[] = [];

  constructor(
    private _demoService: DemoService,
  ) {}

  ngOnInit() {
    this._demoService.getDemos().subscribe((response: Demo[]) => {
      this.demos = response;
    });
  }
}
