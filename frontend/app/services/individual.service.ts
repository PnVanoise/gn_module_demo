import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@geonature/services/config.service';
import { ModuleService } from '@geonature/services/module.service';

import { Individual } from '../models/individual';

@Injectable()
export class IndividualService {
  constructor(
    private _http: HttpClient,
    private _config: ConfigService,
    private _moduleService: ModuleService
  ) {}

  getIndividuals(): Observable<Individual[]> {
    console.log('API endpoint:', `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}/indivs`);
    return this._http.get<Individual[]>(
      `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}/indiv`,
    );
  }

  getIndividual(id_individual: number): Observable<Individual> {
    return this._http.get<Individual>(
      `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}/indiv/${id_individual}`
    );
  }
}
