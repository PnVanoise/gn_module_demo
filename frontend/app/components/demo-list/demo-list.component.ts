import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { Demo } from '../../models/demo';
import { DemoComponent } from '../demo/demo.component';
import { DemoService } from '../../services/demo.service';
import { DemoStateService } from '../../services/demo-state.service';

@Component({
  standalone: true,
  templateUrl: 'demo-list.component.html',
  styleUrls: ['./demo-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GN2CommonModule,
    CommonModule,
    RouterModule,
    DemoComponent
  ],
})
export class DemoListComponent implements OnInit {
  demos$!: Observable<Demo[]>;

  constructor(
    private _demoService: DemoService,
    private _demoState: DemoStateService,
  ) {}

  ngOnInit() {
    this.demos$ = this._demoService.getDemos().pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  trackByDemoId(index: number, demo: Demo) {
    return demo.id_demo;
  }

  selectDemo(demo: Demo) {
    this._demoState.selectDemo(demo.id_demo);
  }
}
