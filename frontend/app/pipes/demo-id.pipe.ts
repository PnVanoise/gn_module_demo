import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'demoId',
  standalone: true,
})
export class DemoIdPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return 'Demo #?';
    }
    return `Demo #${value}`;
  }
}
