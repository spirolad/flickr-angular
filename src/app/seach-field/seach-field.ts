import {Component, computed, EventEmitter, Output, signal} from '@angular/core';
import {FlickrPhoto, FlickrService} from '../service/flickr.service';
import {FormsModule} from '@angular/forms';

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

  @Output() photoChange = new EventEmitter<FlickrPhoto[]>();

  constructor(private flickr: FlickrService) {}

  search() {
    this.error = '';
    this.loading = true;

    this.flickr.searchPhotos(this.query).subscribe({
      next: res => {
        this.loading = false;
        this.photoChange.emit(res.photos.photo);
      },
      error: err => {
        this.error = err;
      }
    });
  }

}
