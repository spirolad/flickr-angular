// src/app/services/flickr.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {environment} from '../../environment/environment';

export interface FlickrPhoto {
  id: string;
  owner: string;
  ownername: string;
  dateupload: string;
  secret: string;
  server: string;
  farm: string;
  title: string;
  ispublic: number;
  isfriend: number;
  isfamily: number;
  tags: string;

  url_s?: string;
  url_m?: string;
  url_l?: string;
  url_o?: string;
}

export interface FlickrSearchResponse {
  stat: string;
  message?: string;
  photos: {
    page: number;
    pages: number;
    perpage: number;
    total: number;
    photo: FlickrPhoto[];
  };
}

export interface FlickrSearchOptions {
  min_upload_date?: number;
  max_upload_date?: number;
  safe_search?: 1 | 2 | 3;
  in_gallery?: 0 | 1;
  extras?: string;
  tags?: string;
}

export interface FlickrCommentsResponse {
  stat: string;
  message?: string;
  comments: {
    comment: Array<{
      id: string;
      author: string;
      authorname: string;
      datecreate: string;
      _content: string;
    }>;
  };
}

export interface FlickrGeoLocationResponse {
  stat: string;
  message?: string;
  code?: number;
  photo?: {
    location: {
      latitude: string;
      longitude: string;
      accuracy: string;

      locality?: { _content: string };
      county?: { _content: string };
      region?: { _content: string };
      country?: { _content: string };
      neighbourhood?: { _content: string };
    };
  };
}

@Injectable({ providedIn: 'root' })
export class FlickrService {
  private readonly endpoint = 'https://www.flickr.com/services/rest/';
  private readonly api_key = environment.flickrApiKey;
  private readonly extras = "owner_name,tags,date_upload"

  constructor(private http: HttpClient) {}

  searchPhotos(text: string, options?: FlickrSearchOptions): Observable<FlickrSearchResponse> {
    let params = new HttpParams()
      .set('method', 'flickr.photos.search')
      .set('api_key', this.api_key)
      .set('format', 'json')
      .set('nojsoncallback', '1');

    if (text.trim()) {
      params = params.set('text', text);
    }

    if (options?.min_upload_date !== undefined) {
      params = params.set('min_upload_date', String(options.min_upload_date));
    }

    if (options?.max_upload_date !== undefined) {
      params = params.set('max_upload_date', String(options.max_upload_date));
    }

    if (options?.safe_search !== undefined) {
      params = params.set('safe_search', options.safe_search);
    }

    if (options?.in_gallery !== undefined) {
      params = params.set('in_gallery', options.in_gallery);
    }

    if (options?.tags?.trim()) {
      params = params.set('tags', options.tags.trim());
    }

    if (options?.extras) {
      options.extras = options.extras + "," + this.extras;
      params = params.set('extras', options.extras);
    } else {
      params.set('extras', this.extras);
    }

    return this.http.get<FlickrSearchResponse>(this.endpoint, {
      params,
      headers: new HttpHeaders({ Accept: 'application/json' }),
    });
  }

  buildPhotoUrl(p: FlickrPhoto): string {
    if (p.url_m) {
      return p.url_m;
    }
    if (p.url_l) {
      return p.url_l;
    }
    if (p.url_s) {
      return p.url_s;
    }
    if (p.url_o) {
      return p.url_o;
    }
    return `https://farm${p.farm}.staticflickr.com/${p.server}/${p.id}_${p.secret}.jpg`;
  }

  getAuthorPublicPhotos(userId: string, perPage = 12): Observable<FlickrSearchResponse> {
    let params = new HttpParams()
      .set('method', 'flickr.people.getPublicPhotos')
      .set('api_key', this.api_key)
      .set('format', 'json')
      .set('nojsoncallback', '1')
      .set('user_id', userId)
      .set('per_page', String(perPage))
      .set('extras', 'url_s');

    return this.http.get<FlickrSearchResponse>(this.endpoint, {
      params,
      headers: new HttpHeaders({ Accept: 'application/json' }),
    });
  }

  getPhotoComments(photoId: string) {
    let params = new HttpParams()
      .set('method', 'flickr.photos.comments.getList')
      .set('api_key', this.api_key)
      .set('format', 'json')
      .set('nojsoncallback', '1')
      .set('photo_id', photoId);

    return this.http.get<FlickrCommentsResponse>(this.endpoint, {
      params,
      headers: new HttpHeaders({ Accept: 'application/json' }),
    });
  }

  getPhotoLocation(photoId: string) {
    let params = new HttpParams()
      .set('method', 'flickr.photos.geo.getLocation')
      .set('api_key', this.api_key)
      .set('format', 'json')
      .set('nojsoncallback', '1')
      .set('photo_id', photoId);

    return this.http.get<FlickrGeoLocationResponse>(this.endpoint, {
      params,
      headers: new HttpHeaders({ Accept: 'application/json' }),
    });
  }

}
