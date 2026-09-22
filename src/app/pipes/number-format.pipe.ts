import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat',
})
export class NumberFormatPipe implements PipeTransform {

  transform(value: number | null | undefined, decimals: number = 1): string {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return '0';
    }

    const units = ['', 'K', 'M', 'B', 'T'];

    let num = Math.abs(value);
    let unitIndex = 0;

    while (num >= 1000 && unitIndex < units.length - 1) {
      num /= 1000;
      unitIndex++;
    }

    const formatted = num
      .toFixed(decimals)
      .replace(/\.0+$/, '');

    return `${value < 0 ? '-' : ''}${formatted}${units[unitIndex]}`;
  }

}
