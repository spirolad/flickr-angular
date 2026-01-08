// src/app/services/flickr.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface FlickrPhoto {
  id: string;
  owner: string;
  secret: string;
  server: string;
  farm: string;
  title: string;
  ispublic: number;
  isfriend: number;
  isfamily: number;
}

export interface FlickrSearchResponse {
  stat: string; // "ok" ou "fail"
  photos: {
    page: number;
    pages: number;
    perpage: number;
    total: number;
    photo: FlickrPhoto[];
  };
}

@Injectable({ providedIn: 'root' })
export class FlickrService {
  private readonly endpoint = 'https://www.flickr.com/services/rest/';
  private readonly api_key = 'df8607cf5be9c69640a794b46b9044f2';

  constructor(private http: HttpClient) {}

  searchPhotos(text: string): Observable<FlickrSearchResponse> {
    let params = new HttpParams()
      .set('method', 'flickr.photos.search')
      .set('api_key', this.api_key)
      .set('format', 'rest')
      .set('auth_token', '72157720961842657-3ebb26d6bb39b5e9')
      .set('api_sig', 'eed79617a6f6dcbdaa2b62f6468bf5b9');

    if (text.trim()) params = params.set('text', text.trim());

    return this.http.get(this.endpoint, {
      params,
      responseType: 'text',
      headers: new HttpHeaders({ Accept: 'text/xml, application/xml' }),
    }).pipe(
      map(xml => this.xmlToJson(xml))
    );
  }

  private xmlToJson(xml: string): FlickrSearchResponse {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');

    const rsp = doc.getElementsByTagName('rsp')[0];
    const stat = rsp?.getAttribute('stat') ?? 'fail';

    const photosNode = doc.getElementsByTagName('photos')[0];

    const page = this.toNumber(photosNode?.getAttribute('page'));
    const pages = this.toNumber(photosNode?.getAttribute('pages'));
    const perpage = this.toNumber(photosNode?.getAttribute('perpage'));
    const total = this.toNumber(photosNode?.getAttribute('total'));

    const photoNodes = Array.from(doc.getElementsByTagName('photo'));

    const photo: FlickrPhoto[] = photoNodes.map(p => ({
      id: p.getAttribute('id') ?? '',
      owner: p.getAttribute('owner') ?? '',
      secret: p.getAttribute('secret') ?? '',
      server: p.getAttribute('server') ?? '',
      farm: p.getAttribute('farm') ?? '',
      title: p.getAttribute('title') ?? '',
      ispublic: this.toNumber(p.getAttribute('ispublic')),
      isfriend: this.toNumber(p.getAttribute('isfriend')),
      isfamily: this.toNumber(p.getAttribute('isfamily')),
    }));

    return {
      stat,
      photos: { page, pages, perpage, total, photo }
    };
  }

  private toNumber(v: string | null | undefined): number {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  }

  buildPhotoUrl(p: Pick<FlickrPhoto, 'farm' | 'server' | 'id' | 'secret'>): string {
    return `https://farm${p.farm}.staticflickr.com/${p.server}/${p.id}_${p.secret}.jpg`;
  }
}
