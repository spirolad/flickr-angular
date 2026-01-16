import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {FlickrDatePipe} from "../pipe/flickr-date-pipe";
import {MatButton} from "@angular/material/button";
import {FlickrCommentsResponse, FlickrPhoto, FlickrService} from '../service/flickr.service';

@Component({
  selector: 'app-photo-info',
    imports: [
        FlickrDatePipe,
        MatButton
    ],
  templateUrl: './photo-info.html',
  styleUrl: './photo-info.css',
})
export class PhotoInfo implements OnChanges {

  @Input({ required: true }) selected: FlickrPhoto | null = null;

  @Output() close = new EventEmitter<void>();

  constructor(private flickrService: FlickrService, private cdr: ChangeDetectorRef) {
  }

  authorPhotos: FlickrPhoto[] = [];
  authorPhotosLoading = false;
  authorPhotosError = '';

  comments: FlickrCommentsResponse['comments']['comment'] = [];
  commentsLoading = false;
  commentsError = '';

  geoLoading = false;
  geoError = '';
  geo: { lat: number; lon: number; label: string } | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selected']) {
      this.fetchAuthorPhotos();
      this.fetchComments();
      this.fetchGeo();
    }
  }

  imgUrl(p: FlickrPhoto): string {
    return p.url_m ?? this.flickrService.buildPhotoUrl(p);
  }

  thumbUrl(p: FlickrPhoto): string {
    return p.url_s ?? p.url_m ?? this.flickrService.buildPhotoUrl(p);
  }

  // Surtout ne pas faire a cause des attaques XSS en temps normal
  htmlToText(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent ?? div.innerText ?? '';
  }

  private fetchAuthorPhotos(): void {
    const p = this.selected;

    this.authorPhotos = [];
    this.authorPhotosError = '';

    if (!p) return;

    this.authorPhotosLoading = true;

    this.flickrService.getAuthorPublicPhotos(p.owner, 12).subscribe({
      next: (res) => {
        this.authorPhotosLoading = false;

        if (res.stat === 'fail') {
          this.authorPhotosError = res.message ?? 'Erreur Flickr';
          return;
        }
        this.authorPhotos = res.photos.photo.filter(x => x.id !== p.id);
        console.log(this.authorPhotos);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.authorPhotosLoading = false;
        this.authorPhotosError = err?.message ?? String(err);
      }
    });
  }

  private fetchComments(): void {
    const p = this.selected;

    this.comments = [];
    this.commentsError = '';

    if (!p) return;

    this.commentsLoading = true;

    this.flickrService.getPhotoComments(p.id).subscribe({
      next: (res) => {
        this.commentsLoading = false;

        if (res.stat === 'fail') {
          this.commentsError = res.message ?? 'Erreur Flickr';
          return;
        }
        if (res.comments.comment) {
          this.comments = res.comments.comment;
        } else {
          this.comments = [];
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.commentsLoading = false;
        this.commentsError = err?.message ?? String(err);
      }
    });
  }

  private fetchGeo(): void {
    const p = this.selected;

    this.geo = null;
    this.geoError = '';

    if (!p) return;

    this.geoLoading = true;

    this.flickrService.getPhotoLocation(p.id).subscribe({
      next: (res) => {
        this.geoLoading = false;

        if (res.stat === 'fail' || !res.photo?.location) {
          this.geoError = res.message ?? 'Position non disponible.';
          return;
        }

        const loc = res.photo.location;

        const lat = Number(loc.latitude);
        const lon = Number(loc.longitude);

        const parts = [
          loc.neighbourhood?._content,
          loc.locality?._content,
          loc.region?._content,
          loc.country?._content,
        ].filter(Boolean);

        this.geo = {
          lat,
          lon,
          label: parts.length ? parts.join(', ') : 'Position disponible',
        };
      },
      error: (err) => {
        this.geoLoading = false;
        this.geoError = err?.message ?? String(err);
      }
    });
  }
}
