import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientXsrfModule } from '@angular/common/http';
import { GN2CommonModule } from '@geonature_common/GN2Common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DemoService } from './services/demo.service';
import { DemoListComponent } from './components/demo-list/demo-list.component';
import { DemoPageComponent } from './components/demo-page/demo-page.component';
import { IndividualService } from './services/individual.service';
import { IndividualListComponent } from './components/individual-list/individual-list.component';
import { IndividualComponent } from './components/individual/individual.component';
import { IndividualListItemComponent } from './components/individual-list-item/individual-list-item.component';
import { IndividualPageComponent } from './components/individual-page/individual-page.component';
import { IndividualAddComponent } from './components/individual-add/individual-add.component';
import { IndividualFormComponent } from './components/individual-form/individual-form.component';

export const routes: Routes = [
  {
    path: "d",
    component: DemoListComponent,
  },
  {
    path: "d/:id_demo",
    component: DemoPageComponent,
  },
  {
    path: "ind",
    children: [
      {
        path: "",
        component: IndividualListComponent,
      },
      {
        path: "add",
        component: IndividualFormComponent,
      },
      {
        path: "edit/:id_individual",
        component: IndividualFormComponent,
      },
      {
        path: ":id_individual",
        component: IndividualPageComponent,
      },
    ],
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
    DemoPageComponent,
    IndividualListComponent,
    IndividualAddComponent,
    IndividualFormComponent,
    IndividualComponent,
    IndividualListItemComponent,
    IndividualPageComponent,
  ],
  providers: [DemoService, IndividualService],
  bootstrap: [],
})
export class GeonatureModule {}
