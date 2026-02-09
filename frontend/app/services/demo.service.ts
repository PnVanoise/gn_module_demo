import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@geonature/services/config.service';
import { ModuleService } from '@geonature/services/module.service';

import { DEMO_ENDPOINTS } from '../constants/demo-endpoints';
import { Demo } from '../models/demo';
import { DemoStats } from '../models/demo-stats';
import { Individual, IndividualPayload } from '../models/individual';
import { PaginatedResponse } from '../models/pagination';
import { TaxrefLite } from '../models/taxref';

@Injectable()
export class DemoService {
  constructor(
    private _http: HttpClient,
    private _config: ConfigService,
    private _moduleService: ModuleService
  ) {}

  private get baseUrl(): string {
    return `${this._config.API_ENDPOINT}/${this._moduleService.currentModule.module_url}`;
  }

  private buildUrl(path: string): string {
    if (!path) {
      return `${this.baseUrl}/`;
    }
    return `${this.baseUrl}/${path}`;
  }

  getDemos(): Observable<Demo[]> {
    return this._http.get<Demo[]>(this.buildUrl(DEMO_ENDPOINTS.demos));
  }

  getDemo(id_demo: number): Observable<Demo> {
    return this._http.get<Demo>(this.buildUrl(String(id_demo)));
  }

  getIndividuals(page = 1, limit = 10): Observable<PaginatedResponse<Individual>> {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this._http.get<PaginatedResponse<Individual>>(this.buildUrl(DEMO_ENDPOINTS.individuals), {
      params,
    });
  }

  createIndividual(payload: IndividualPayload): Observable<Individual> {
    return this._http.post<Individual>(this.buildUrl(DEMO_ENDPOINTS.individuals), payload);
  }

  getDemoStats(a: number, b: number): Observable<DemoStats> {
    const params = new HttpParams().set('a', a).set('b', b);
    return this._http.get<DemoStats>(this.buildUrl(DEMO_ENDPOINTS.demoStats), { params });
  }

  searchTaxref(query: string, limit = 10): Observable<TaxrefLite[]> {
    const params = new HttpParams().set('q', query).set('limit', limit);
    return this._http.get<TaxrefLite[]>(this.buildUrl(DEMO_ENDPOINTS.taxrefAutocomplete), {
      params,
    });
  }

  getMockStrategies(strategies: string[]): Observable<{ strategies: Array<{ strategy: string; count: number }> }> {
    let params = new HttpParams();
    strategies.forEach((strategy) => {
      params = params.append('strategy', strategy);
    });
    return this._http.get<{ strategies: Array<{ strategy: string; count: number }> }>(
      this.buildUrl(DEMO_ENDPOINTS.mockStrategies),
      { params }
    );
  }
}
