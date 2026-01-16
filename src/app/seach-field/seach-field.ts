import {Component, computed, EventEmitter, Output, signal} from '@angular/core';
import {FlickrPhoto, FlickrSearchOptions, FlickrService} from '../service/flickr.service';
import {FormsModule} from '@angular/forms';
import {MatFormField, MatHint, MatLabel} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatChipGrid, MatChipRow} from '@angular/material/chips';

@Component({
  selector: 'app-seach-field',
  imports: [
    FormsModule
  ],
  templateUrl: './seach-field.html',
  styleUrl: './seach-field.css',
})
export class SeachField {

  query = '';
  loading = false;
  error = '';

  minDate = '';
  maxDate = '';
  allowNsfw = false;
  onlyInGallery = false;
  imgSize: 's' | 'm' | 'l' | 'o' = 'o';
  tagInput = '';


  @Output() photoChange = new EventEmitter<FlickrPhoto[]>();

  constructor(private flickr: FlickrService) {}

  private toUnixSeconds(dateStr: string, endOfDay = false): number | null {
    if (!dateStr) return null;

    const iso = endOfDay
      ? `${dateStr}T23:59:59`
      : `${dateStr}T00:00:00`;

    const ms = new Date(iso).getTime();
    if (Number.isNaN(ms)) return null;

    return Math.floor(ms / 1000);
  }

  search() {

    if (this.query.trim().length === 0 && this.tagInput.trim().length === 0) {
      this.error = 'Veuillez entrer un nom ou un tag'
      return;
    }

    const minTs = this.toUnixSeconds(this.minDate, false);
    const maxTs = this.toUnixSeconds(this.maxDate, true);

    if (minTs !== null && maxTs !== null && minTs > maxTs) {
      this.error = 'La date minimum doit être avant la date max';
      return;
    }

    this.error = '';
    this.loading = true;

    const extrasBySize: Record<'s' | 'm' | 'l' | 'o', string> = {
      s: 'url_s',
      m: 'url_m',
      l: 'url_l',
      o: 'url_o'
    };

    const options: FlickrSearchOptions = {
      max_upload_date: maxTs ?? undefined,
      min_upload_date: minTs ?? undefined,
      safe_search: this.allowNsfw ? 3 : 1,
      in_gallery: this.onlyInGallery ? 1 : 0,
      extras: extrasBySize[this.imgSize],
      tags: this.tagInput,
    }

    this.flickr.searchPhotos(this.query, options).subscribe({
      next: res => {
        this.loading = false;
        if (res.stat == 'fail') {
          console.log(res);
          this.error = res.message ?? '';
        } else {
          this.photoChange.emit(res.photos.photo);
        }
      },
      error: err => {
        this.error = err;
      }
    });
  }

}
