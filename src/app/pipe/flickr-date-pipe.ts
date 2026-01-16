import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'flickrDate',
})
export class FlickrDatePipe implements PipeTransform {

  transform(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    const seconds = Number(value);
    if (Number.isNaN(seconds)) {
      return '';
    }

    const date = new Date(seconds * 1000);

    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

}
