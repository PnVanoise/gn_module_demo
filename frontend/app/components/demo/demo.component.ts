import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { ConfigService } from '@geonature/services/config.service';

import {
  Demo,
} from '../../models/demo';

@Component({
  standalone: true,
  selector: 'pnx-demo',
  templateUrl: 'demo.component.html',
  styleUrls: ['./demo.component.scss'],
  imports: [
    GN2CommonModule,
    CommonModule,
  ],
})
export class DemoComponent {
  @Input()
  demo: Demo | null = null;

  constructor(private _configService: ConfigService)
  {}

  get text(): string {
    return this._configService.DEMO.TEXT;
  }
}
