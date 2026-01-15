import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientXsrfModule } from '@angular/common/http';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DemoService } from './services/demo.service';
import { DemoListComponent } from './components/demo-list/demo-list.component';
import { DemoPageComponent } from './components/demo-page/demo-page.component';

export const routes: Routes = [
  {
    path: "",
    component: DemoListComponent,
  },
  {
    path: ":id_demo",
    component: DemoPageComponent,
  },
];

@NgModule({
  imports: [
    HttpClientXsrfModule.withOptions({
      cookieName: 'token',
      headerName: 'token',
    }),
    CommonModule,
    GN2CommonModule,
    NgbModule,
    RouterModule.forChild(routes),
    // Module component
    DemoListComponent,
    DemoPageComponent
  ],
  providers: [DemoService],
  bootstrap: [],
})
export class GeonatureModule {}
