import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[demoHighlight]',
  standalone: true,
})
export class DemoHighlightDirective implements OnChanges {
  @Input() demoHighlight: number | null = null;
  @Input() demoHighlightColor = '#fff3cd';

  constructor(private _el: ElementRef, private _renderer: Renderer2) {}

  ngOnChanges(): void {
    if (this.demoHighlight === null || this.demoHighlight === undefined) {
      this._renderer.removeStyle(this._el.nativeElement, 'background-color');
      return;
    }
    this._renderer.setStyle(this._el.nativeElement, 'background-color', this.demoHighlightColor);
  }
}
