import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@geonature/services/config.service';
import { Individual } from '../models/individual';
import { ModuleService } from '@geonature/services/module.service';

@Injectable()
export class IndividualService {
  constructor(
    private _http: HttpClient,
    private _config: ConfigService,
    private _moduleService: ModuleService
  ) {}
  getIndividuals(): Observable<Individual[]> {
    return this._http.get<Individual[]>(
      `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}/indiv`,
    );
  }
  getIndividual(id_individual: number): Observable<Individual> {
    return this._http.get<Individual>(
      `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}/indiv/${id_individual}`
    );
  }
  createIndividual(individual: Partial<Individual>): Observable<Individual> {
    return this._http.post<Individual>(
      `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}/indiv`,
      individual
    );
  }
  updateIndividual(id_individual: number, individual: Partial<Individual>): Observable<Individual> {
    return this._http.put<Individual>(
      `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}/indiv/${id_individual}`,
      individual
    );
  }

  deleteIndividual(id_individual: number): Observable<void> {
    return this._http.delete<void>(
      `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}/indiv/${id_individual}`
    );
  }
}
