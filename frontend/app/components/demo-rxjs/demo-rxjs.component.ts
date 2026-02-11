import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subscription, Subject, fromEvent, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, startWith, switchMap, takeUntil, tap, toArray } from 'rxjs/operators';

import { DemoService } from '../../services/demo.service';
import { TaxrefLite } from '../../models/taxref';
import {
  FilterSimulationMode,
  CombinationSimulationKey,
  HotColdSimulationEvent,
  HotColdSimulationMode,
  OperatorSimulationEvent,
  OperatorSimulationKey,
  OperatorSimulationPreview,
  RxjsLabService
} from '../../services/rxjs-lab.service';

type SimulationBlock = 'filter' | 'conditional' | 'transform' | 'aggregation';

interface SimulationState {
  logs: OperatorSimulationEvent[];
  preview: OperatorSimulationPreview;
  timeline: Array<{ value: string; emittedAt: number; completesAt?: number }>;
  running: boolean;
}

@Component({
  standalone: true,
  templateUrl: './demo-rxjs.component.html',
  styleUrls: ['./demo-rxjs.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class DemoRxjsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('clickButton', { static: true })
  clickButton!: ElementRef<HTMLButtonElement>;

  searchControl = new FormControl('');
  transformOperatorControl = new FormControl('switchMap');
  aggregationOperatorControl = new FormControl('scan');
  conditionalOperatorControl = new FormControl('iif');
  conditionControl = new FormControl(true);
  sourceDelayA = new FormControl(0);
  sourceDelayB = new FormControl(120);
  sourceDelayC = new FormControl(120);
  innerDelayA = new FormControl(300);
  innerDelayB = new FormControl(200);
  innerDelayC = new FormControl(100);
  filterValues = new FormControl('1,2,3,4,5,6');
  filterMode = new FormControl<FilterSimulationMode>('even');
  filterThreshold = new FormControl(3);
  filterInterval = new FormControl(120);
  takeWhileValues = new FormControl('1,2,3,4,5,6');
  takeWhileThreshold = new FormControl(4);
  takeWhileInterval = new FormControl(120);
  defaultIfEmptyEmpty = new FormControl(false);
  defaultIfEmptyValues = new FormControl('1,2,3');
  defaultIfEmptyInterval = new FormControl(120);
  mapValues = new FormControl('1,2,3,4');
  mapInterval = new FormControl(120);
  aggregationValues = new FormControl('1,2,3,4');
  aggregationInterval = new FormControl(120);
  iifCacheValue = new FormControl('cache');
  iifApiValue = new FormControl('api');
  iifDelay = new FormControl(200);
  hotColdModeControl = new FormControl<HotColdSimulationMode>('cold');
  hotColdValues = new FormControl('A,B,C,D');
  hotColdInterval = new FormControl(200);
  hotColdSubBDelay = new FormControl(300);
  combinationOperatorControl = new FormControl<CombinationSimulationKey>('combineLatest');
  combinationValuesA = new FormControl('1,2,3');
  combinationValuesB = new FormControl('A,B,C');
  combinationIntervalA = new FormControl(120);
  combinationIntervalB = new FormControl(180);
  clickCount = 0;
  manualSubscriptionLog: string[] = [];
  simulationStates!: Record<SimulationBlock, SimulationState>;
  hotColdLogs: HotColdSimulationEvent[] = [];
  hotColdPreview: Array<{ value: string | number; delay: number }> = [];
  hotColdRunning = false;
  combinationLogs: OperatorSimulationEvent[] = [];
  combinationPreviewA: Array<{ value: string | number; delay: number }> = [];
  combinationPreviewB: Array<{ value: string | number; delay: number }> = [];
  combinationRunning = false;
  conditionalOperatorOptions: Array<{ key: OperatorSimulationKey; label: string }> = [
    { key: 'iif', label: 'iif' },
    { key: 'takeWhile', label: 'takeWhile' },
    { key: 'defaultIfEmpty', label: 'defaultIfEmpty' },
  ];
  combinationOperatorOptions: Array<{ key: CombinationSimulationKey; label: string }> = [
    { key: 'combineLatest', label: 'combineLatest' },
    { key: 'merge', label: 'merge' },
    { key: 'zip', label: 'zip' },
    { key: 'partition', label: 'partition' },
  ];
  transformOperatorOptions: Array<{ key: OperatorSimulationKey; label: string }> = [
    { key: 'map', label: 'map' },
    { key: 'switchMap', label: 'switchMap' },
    { key: 'mergeMap', label: 'mergeMap' },
    { key: 'concatMap', label: 'concatMap' },
    { key: 'exhaustMap', label: 'exhaustMap' },
  ];
  aggregationOperatorOptions: Array<{ key: OperatorSimulationKey; label: string }> = [
    { key: 'scan', label: 'scan' },
    { key: 'reduce', label: 'reduce' },
  ];
  introPoints = [
    'Programmation reactive : flux de donnees et propagation des changements.',
    'ReactiveX : famille de bibliotheques Rx multi-langages (RxJava, RxJS, RxSwift).',
    'RxJS : implementation JavaScript/TypeScript utilisee par Angular.',
    'Concepts clefs : Observable, Observer, Subscription, Operateurs.',
  ];

  readonly observerPatternLogs$ = this._lab.observerPatternLogs$();
  readonly observableContractLogs$ = this._lab.observableContractLogs$();
  readonly manualObservable$ = this._lab.manualObservable$().pipe(toArray());
  readonly fromData$ = this._lab.fromData$().pipe(toArray());
  readonly fromPromise$ = this._lab.fromPromise$().pipe(toArray());
  readonly lazyEvaluation$ = this._lab.lazyEvaluation$().pipe(toArray());
  readonly wrapTimeout$ = this._lab.wrapTimeout$().pipe(toArray());
  readonly operatorPipeline$ = this._lab.operatorPipeline$().pipe(toArray());
  readonly filterOperators$ = this._lab.filterOperators$().pipe(toArray());
  readonly conditionalOperators$ = this._lab.conditionalOperators$().pipe(toArray());
  readonly transformOperators$ = this._lab.transformOperators$().pipe(toArray());
  readonly aggregationOperators$ = this._lab.aggregationOperators$().pipe(toArray());
  readonly utilityOperators$ = this._lab.utilityOperators$().pipe(toArray());
  readonly customOperator$ = this._lab.customOperator$().pipe(toArray());
  readonly hotCold = this._lab.hotColdExamples();
  readonly combinations = this._lab.combinationExamples();
  readonly partitions = this._lab.partitionExamples();
  readonly higherOrder = this._lab.higherOrderExamples();
  readonly errorHandling = this._lab.errorHandlingExamples();

  results$: Observable<TaxrefLite[]> = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter((value) => typeof value === 'string'),
    switchMap((query) => {
      const trimmed = (query || '').trim();
      if (trimmed.length < 2) {
        return of([]);
      }
      return this._demoService.searchTaxref(trimmed).pipe(catchError(() => of([])));
    }),
    startWith([])
  );

  private _destroy$ = new Subject<void>();
  private _subscriptions = new Subscription();
  private _unsubscribeTimer?: number;
  private _simulationSubs: Partial<Record<SimulationBlock, Subscription>> = {};
  private _hotColdSub?: Subscription;
  private _combinationSub?: Subscription;

  constructor(
    private _demoService: DemoService,
    private _lab: RxjsLabService
  ) {
    this.startManualSubscriptionDemo();
    this.simulationStates = {
      filter: this.createSimulationState('filter'),
      conditional: this.createSimulationState('conditional'),
      transform: this.createSimulationState('transform'),
      aggregation: this.createSimulationState('aggregation'),
    };
    this.hotColdPreview = this.buildHotColdSource();
    this.combinationPreviewA = this.buildCombinationSourceA();
    this.combinationPreviewB = this.buildCombinationSourceB();
    this._subscriptions.add(
      this.transformOperatorControl.valueChanges.subscribe(() =>
        this.updateSimulationPreview('transform')
      )
    );
    this._subscriptions.add(
      this.aggregationOperatorControl.valueChanges.subscribe(() =>
        this.updateSimulationPreview('aggregation')
      )
    );
    this._subscriptions.add(
      this.conditionalOperatorControl.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.conditionControl.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.sourceDelayA.valueChanges.subscribe(() =>
        this.updateSimulationPreview('transform')
      )
    );
    this._subscriptions.add(
      this.sourceDelayB.valueChanges.subscribe(() =>
        this.updateSimulationPreview('transform')
      )
    );
    this._subscriptions.add(
      this.sourceDelayC.valueChanges.subscribe(() =>
        this.updateSimulationPreview('transform')
      )
    );
    this._subscriptions.add(
      this.innerDelayA.valueChanges.subscribe(() =>
        this.updateSimulationPreview('transform')
      )
    );
    this._subscriptions.add(
      this.innerDelayB.valueChanges.subscribe(() =>
        this.updateSimulationPreview('transform')
      )
    );
    this._subscriptions.add(
      this.innerDelayC.valueChanges.subscribe(() =>
        this.updateSimulationPreview('transform')
      )
    );
    this._subscriptions.add(
      this.filterValues.valueChanges.subscribe(() =>
        this.updateSimulationPreview('filter')
      )
    );
    this._subscriptions.add(
      this.filterMode.valueChanges.subscribe(() =>
        this.updateSimulationPreview('filter')
      )
    );
    this._subscriptions.add(
      this.filterThreshold.valueChanges.subscribe(() =>
        this.updateSimulationPreview('filter')
      )
    );
    this._subscriptions.add(
      this.filterInterval.valueChanges.subscribe(() =>
        this.updateSimulationPreview('filter')
      )
    );
    this._subscriptions.add(
      this.takeWhileValues.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.takeWhileThreshold.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.takeWhileInterval.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.defaultIfEmptyEmpty.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.defaultIfEmptyValues.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.defaultIfEmptyInterval.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.mapValues.valueChanges.subscribe(() =>
        this.updateSimulationPreview('transform')
      )
    );
    this._subscriptions.add(
      this.mapInterval.valueChanges.subscribe(() =>
        this.updateSimulationPreview('transform')
      )
    );
    this._subscriptions.add(
      this.aggregationValues.valueChanges.subscribe(() =>
        this.updateSimulationPreview('aggregation')
      )
    );
    this._subscriptions.add(
      this.aggregationInterval.valueChanges.subscribe(() =>
        this.updateSimulationPreview('aggregation')
      )
    );
    this._subscriptions.add(
      this.iifCacheValue.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.iifApiValue.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.iifDelay.valueChanges.subscribe(() =>
        this.updateSimulationPreview('conditional')
      )
    );
    this._subscriptions.add(
      this.hotColdModeControl.valueChanges.subscribe(() => this.updateHotColdPreview())
    );
    this._subscriptions.add(
      this.hotColdValues.valueChanges.subscribe(() => this.updateHotColdPreview())
    );
    this._subscriptions.add(
      this.hotColdInterval.valueChanges.subscribe(() => this.updateHotColdPreview())
    );
    this._subscriptions.add(
      this.hotColdSubBDelay.valueChanges.subscribe(() => this.updateHotColdPreview())
    );
    this._subscriptions.add(
      this.combinationOperatorControl.valueChanges.subscribe(() => this.updateCombinationPreview())
    );
    this._subscriptions.add(
      this.combinationValuesA.valueChanges.subscribe(() => this.updateCombinationPreview())
    );
    this._subscriptions.add(
      this.combinationValuesB.valueChanges.subscribe(() => this.updateCombinationPreview())
    );
    this._subscriptions.add(
      this.combinationIntervalA.valueChanges.subscribe(() => this.updateCombinationPreview())
    );
    this._subscriptions.add(
      this.combinationIntervalB.valueChanges.subscribe(() => this.updateCombinationPreview())
    );
  }

  ngAfterViewInit(): void {
    const click$ = fromEvent(this.clickButton.nativeElement, 'click').pipe(
      tap(() => {
        this.clickCount += 1;
      }),
      takeUntil(this._destroy$)
    );
    this._subscriptions.add(click$.subscribe());
  }

  ngOnDestroy(): void {
    this.cancelSimulation();
    this.cancelHotColdSimulation();
    this.cancelCombinationSimulation();
    this._destroy$.next();
    this._destroy$.complete();
    this._subscriptions.unsubscribe();
    if (this._unsubscribeTimer) {
      clearTimeout(this._unsubscribeTimer);
    }
  }

  simulateOperatorFor(block: SimulationBlock) {
    this.cancelSimulation(block);
    const state = this.simulationStates[block];
    state.logs = [];
    state.running = true;
    const operator = this.getOperatorForBlock(block);
    const condition = this.getConditionForBlock(block);
    const overrides = this.getOverridesForOperator(operator);
    this._simulationSubs[block] = this._lab
      .simulateOperator$(operator, { condition, ...overrides })
      .subscribe({
        next: (event) => {
          state.logs = [...state.logs, event];
        },
        error: () => {
          state.running = false;
          this._simulationSubs[block] = undefined;
        },
        complete: () => {
          state.running = false;
          this._simulationSubs[block] = undefined;
        },
      });
  }

  clearSimulationFor(block: SimulationBlock) {
    this.cancelSimulation(block);
    this.simulationStates[block].logs = [];
  }

  simulateHotCold() {
    this.cancelHotColdSimulation();
    this.hotColdLogs = [];
    this.hotColdRunning = true;
    const mode = this.hotColdModeControl.value ?? 'cold';
    const source = this.buildHotColdSource();
    const subBDelay = this.normalizeDelay(this.hotColdSubBDelay.value, 300);
    this.hotColdPreview = source;
    this._hotColdSub = this._lab
      .simulateHotCold$(mode, { source, subBDelay })
      .subscribe({
        next: (event) => {
          this.hotColdLogs = [...this.hotColdLogs, event];
        },
        error: () => {
          this.hotColdRunning = false;
          this._hotColdSub = undefined;
        },
        complete: () => {
          this.hotColdRunning = false;
          this._hotColdSub = undefined;
        },
      });
  }

  clearHotColdSimulation() {
    this.cancelHotColdSimulation();
    this.hotColdLogs = [];
  }

  simulateCombination() {
    this.cancelCombinationSimulation();
    this.combinationLogs = [];
    this.combinationRunning = true;
    const key = this.getCombinationOperator();
    const sourceA = this.buildCombinationSourceA();
    const sourceB = this.buildCombinationSourceB();
    this.combinationPreviewA = sourceA;
    this.combinationPreviewB = sourceB;
    this._combinationSub = this._lab
      .simulateCombination$(key, { sourceA, sourceB })
      .subscribe({
        next: (event) => {
          this.combinationLogs = [...this.combinationLogs, event];
        },
        error: () => {
          this.combinationRunning = false;
          this._combinationSub = undefined;
        },
        complete: () => {
          this.combinationRunning = false;
          this._combinationSub = undefined;
        },
      });
  }

  clearCombinationSimulation() {
    this.cancelCombinationSimulation();
    this.combinationLogs = [];
  }

  private startManualSubscriptionDemo(): void {
    const subscription = this._lab.subscriptionDemo$().subscribe((value) => {
      this.manualSubscriptionLog.push(value);
    });
    this._subscriptions.add(subscription);

    this._unsubscribeTimer = window.setTimeout(() => {
      subscription.unsubscribe();
      this.manualSubscriptionLog.push('unsubscribed');
    }, 1200);
  }

  private getOperatorForBlock(block: SimulationBlock): OperatorSimulationKey {
    switch (block) {
      case 'filter':
        return 'filter';
      case 'conditional':
        return this.getConditionalOperator();
      case 'aggregation':
        return this.getAggregationOperator();
      case 'transform':
      default:
        return this.getTransformOperator();
    }
  }

  private getConditionForBlock(block: SimulationBlock): boolean {
    if (block !== 'conditional') {
      return true;
    }
    return this.getConditionalOperator() === 'iif' ? Boolean(this.conditionControl.value) : true;
  }

  private getConditionalOperator(): OperatorSimulationKey {
    const value = this.conditionalOperatorControl.value;
    if (this.conditionalOperatorOptions.some((item) => item.key === value)) {
      return value as OperatorSimulationKey;
    }
    return 'iif';
  }

  private getTransformOperator(): OperatorSimulationKey {
    const value = this.transformOperatorControl.value;
    if (this.transformOperatorOptions.some((item) => item.key === value)) {
      return value as OperatorSimulationKey;
    }
    return 'switchMap';
  }

  private getAggregationOperator(): OperatorSimulationKey {
    const value = this.aggregationOperatorControl.value;
    if (this.aggregationOperatorOptions.some((item) => item.key === value)) {
      return value as OperatorSimulationKey;
    }
    return 'scan';
  }

  private updateSimulationPreview(block: SimulationBlock) {
    const operator = this.getOperatorForBlock(block);
    const condition = this.getConditionForBlock(block);
    const overrides = this.getOverridesForOperator(operator);
    const preview = this._lab.getSimulationPreview(operator, condition, overrides);
    this.simulationStates[block].preview = preview;
    this.simulationStates[block].timeline = this.buildSimulationTimeline(preview);
  }

  private createSimulationState(block: SimulationBlock): SimulationState {
    const operator = this.getOperatorForBlock(block);
    const condition = this.getConditionForBlock(block);
    const overrides = this.getOverridesForOperator(operator);
    const preview = this._lab.getSimulationPreview(operator, condition, overrides);
    return {
      logs: [],
      preview,
      timeline: this.buildSimulationTimeline(preview),
      running: false,
    };
  }

  private cancelSimulation(block?: SimulationBlock) {
    if (!block) {
      (Object.keys(this.simulationStates) as SimulationBlock[]).forEach((key) =>
        this.cancelSimulation(key)
      );
      return;
    }
    const existing = this._simulationSubs[block];
    if (existing) {
      existing.unsubscribe();
      this._simulationSubs[block] = undefined;
    }
    this.simulationStates[block].running = false;
  }

  private cancelHotColdSimulation() {
    if (this._hotColdSub) {
      this._hotColdSub.unsubscribe();
      this._hotColdSub = undefined;
    }
    this.hotColdRunning = false;
  }

  private updateHotColdPreview() {
    this.hotColdPreview = this.buildHotColdSource();
  }

  private cancelCombinationSimulation() {
    if (this._combinationSub) {
      this._combinationSub.unsubscribe();
      this._combinationSub = undefined;
    }
    this.combinationRunning = false;
  }

  private updateCombinationPreview() {
    this.combinationPreviewA = this.buildCombinationSourceA();
    this.combinationPreviewB = this.buildCombinationSourceB();
  }

  private buildHotColdSource() {
    const values = this.parseList(this.hotColdValues.value, ['A', 'B', 'C', 'D']);
    const interval = this.normalizeDelay(this.hotColdInterval.value, 200);
    return values.map((value, index) => ({
      value,
      delay: index === 0 ? 0 : interval,
    }));
  }

  private getCombinationOperator(): CombinationSimulationKey {
    const value = this.combinationOperatorControl.value;
    if (this.combinationOperatorOptions.some((item) => item.key === value)) {
      return value as CombinationSimulationKey;
    }
    return 'combineLatest';
  }

  private buildCombinationSourceA() {
    const key = this.getCombinationOperator();
    if (key === 'partition') {
      const values = this.parseNumericList(this.combinationValuesA.value, [1, 2, 3, 4]);
      const interval = this.normalizeDelay(this.combinationIntervalA.value, 120);
      return values.map((value, index) => ({
        value,
        delay: index === 0 ? 0 : interval,
      }));
    }
    const values = this.parseList(this.combinationValuesA.value, ['1', '2', '3']);
    const interval = this.normalizeDelay(this.combinationIntervalA.value, 120);
    return values.map((value, index) => ({
      value,
      delay: index === 0 ? 0 : interval,
    }));
  }

  private buildCombinationSourceB() {
    const key = this.getCombinationOperator();
    if (key === 'partition') {
      return [];
    }
    const values = this.parseList(this.combinationValuesB.value, ['A', 'B', 'C']);
    const interval = this.normalizeDelay(this.combinationIntervalB.value, 180);
    return values.map((value, index) => ({
      value,
      delay: index === 0 ? 0 : interval,
    }));
  }

  isTimingOperator(operator?: OperatorSimulationKey): boolean {
    const key = operator ?? this.getTransformOperator();
    return (
      key === 'switchMap' ||
      key === 'mergeMap' ||
      key === 'concatMap' ||
      key === 'exhaustMap'
    );
  }

  private getOverridesForOperator(operator: OperatorSimulationKey) {
    if (!this.isTimingOperator(operator)) {
      if (operator === 'filter') {
        return this.buildFilterOverrides();
      }
      if (operator === 'iif') {
        return this.buildIifOverrides();
      }
      if (operator === 'takeWhile') {
        return this.buildTakeWhileOverrides();
      }
      if (operator === 'defaultIfEmpty') {
        return this.buildDefaultIfEmptyOverrides();
      }
      if (operator === 'map') {
        return this.buildMapOverrides();
      }
      if (operator === 'scan' || operator === 'reduce') {
        return this.buildAggregationOverrides();
      }
      return undefined;
    }
    return this.buildTimingOverrides();
  }

  private buildTimingOverrides() {
    const source = [
      { value: 'A', delay: this.normalizeDelay(this.sourceDelayA.value, 0) },
      { value: 'B', delay: this.normalizeDelay(this.sourceDelayB.value, 120) },
      { value: 'C', delay: this.normalizeDelay(this.sourceDelayC.value, 120) },
    ];
    const inner = [
      { value: 'A', delay: this.normalizeDelay(this.innerDelayA.value, 300) },
      { value: 'B', delay: this.normalizeDelay(this.innerDelayB.value, 200) },
      { value: 'C', delay: this.normalizeDelay(this.innerDelayC.value, 100) },
    ];
    return { source, inner };
  }

  private buildFilterOverrides() {
    const values = this.parseNumericList(this.filterValues.value, [1, 2, 3, 4, 5, 6]);
    const interval = this.normalizeDelay(this.filterInterval.value, 120);
    const source = values.map((value, index) => ({
      value,
      delay: index === 0 ? 0 : interval,
    }));
    const mode = this.filterMode.value ?? 'even';
    const threshold = this.normalizeDelay(this.filterThreshold.value, 3);
    return { source, filterMode: mode, filterThreshold: threshold };
  }

  private buildAggregationOverrides() {
    const values = this.parseNumericList(this.aggregationValues.value, [1, 2, 3, 4]);
    const interval = this.normalizeDelay(this.aggregationInterval.value, 120);
    const source = values.map((value, index) => ({
      value,
      delay: index === 0 ? 0 : interval,
    }));
    return { source };
  }

  private buildTakeWhileOverrides() {
    const values = this.parseNumericList(this.takeWhileValues.value, [1, 2, 3, 4, 5, 6]);
    const interval = this.normalizeDelay(this.takeWhileInterval.value, 120);
    const source = values.map((value, index) => ({
      value,
      delay: index === 0 ? 0 : interval,
    }));
    const threshold = this.normalizeDelay(this.takeWhileThreshold.value, 4);
    return { source, filterThreshold: threshold };
  }

  private buildDefaultIfEmptyOverrides() {
    const isEmpty = Boolean(this.defaultIfEmptyEmpty.value);
    if (isEmpty) {
      return { source: [] };
    }
    const values = this.parseNumericList(this.defaultIfEmptyValues.value, [1, 2, 3]);
    const interval = this.normalizeDelay(this.defaultIfEmptyInterval.value, 120);
    const source = values.map((value, index) => ({
      value,
      delay: index === 0 ? 0 : interval,
    }));
    return { source };
  }

  private buildMapOverrides() {
    const values = this.parseNumericList(this.mapValues.value, [1, 2, 3, 4]);
    const interval = this.normalizeDelay(this.mapInterval.value, 120);
    const source = values.map((value, index) => ({
      value,
      delay: index === 0 ? 0 : interval,
    }));
    return { source };
  }

  private buildIifOverrides() {
    return {
      iifCacheValue: this.iifCacheValue.value || 'cache',
      iifApiValue: this.iifApiValue.value || 'api',
      iifDelay: this.normalizeDelay(this.iifDelay.value, 200),
    };
  }

  private parseNumericList(value: unknown, fallback: number[]) {
    if (typeof value !== 'string') {
      return fallback;
    }
    const numbers = value
      .split(',')
      .map((entry) => Number(entry.trim()))
      .filter((entry) => Number.isFinite(entry));
    return numbers.length ? numbers : fallback;
  }

  private parseList(value: unknown, fallback: Array<string | number>) {
    if (typeof value !== 'string') {
      return fallback;
    }
    const items = value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    return items.length ? items : fallback;
  }

  private normalizeDelay(value: unknown, fallback: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return fallback;
    }
    return parsed;
  }

  private buildSimulationTimeline(preview: OperatorSimulationPreview) {
    let emittedAt = 0;
    return preview.source.map((item) => {
      emittedAt += item.delay;
      const innerDelay = preview.inner?.find((inner) => String(inner.value) === String(item.value))?.delay;
      const completesAt = typeof innerDelay === 'number' ? emittedAt + innerDelay : undefined;
      return {
        value: String(item.value),
        emittedAt,
        completesAt,
      };
    });
  }
}
