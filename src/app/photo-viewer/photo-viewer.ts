import { Component, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';

import {FlickrPhoto, FlickrService} from '../service/flickr.service';
import {SeachField} from '../seach-field/seach-field';
import {FlickrDatePipe} from '../pipe/flickr-date-pipe';
import {PhotoInfo} from '../photo-info/photo-info';

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  imports: [CommonModule, SeachField, MatSidenavModule, MatButtonModule, PhotoInfo],
  templateUrl: './photo-viewer.html',
})
export class PhotoViewer {
  photos = signal<FlickrPhoto[]>([]);
  selected = signal<FlickrPhoto | null>(null);

  @ViewChild('drawer') drawer!: MatDrawer;

  constructor(private flickrService: FlickrService) {
  }

  onPhotosChange(list: FlickrPhoto[]) {
    this.photos.set(list);
    this.selected.set(null);
    this.drawer?.close();
  }

  open(p: FlickrPhoto) {
    this.selected.set(p);
    this.drawer.open();
  }

  close() {
    this.drawer.close();
  }

  imgUrl(p: FlickrPhoto ): string | undefined {
    return this.flickrService.buildPhotoUrl(p);
  }

}
