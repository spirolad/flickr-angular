import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoInfo } from './photo-info';
import {of, throwError} from 'rxjs';
import {FlickrPhoto, FlickrService} from '../service/flickr.service';

describe('PhotoInfo', () => {
  let fixture: ComponentFixture<PhotoInfo>;
  let component: PhotoInfo;

  const flickr = {
    buildPhotoUrl: vi.fn(),
    getAuthorPublicPhotos: vi.fn(),
    getPhotoComments: vi.fn(),
    getPhotoLocation: vi.fn(),
  };

  const selectedPhoto: FlickrPhoto = {
    id: 'p1',
    owner: 'owner1',
    secret: 's',
    server: 'srv',
    farm: '1',
    title: 'Title',
    ispublic: 1,
    isfriend: 0,
    isfamily: 0,
    ownername: 'Alice',
    dateupload: '1768472602',
    url_m: 'https://example.com/m.jpg',
    url_s: 'https://example.com/s.jpg',
    tags: 'cat'
  };

  beforeEach(async () => {
    flickr.buildPhotoUrl.mockReturnValue('https://fallback.jpg');

    await TestBed.configureTestingModule({
      imports: [PhotoInfo],
      providers: [{ provide: FlickrService, useValue: flickr }],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();

    vi.clearAllMocks();
  });

  it('Should create', () => {
    expect(component).toBeTruthy();
  });

  it('htmlToText strips HTML', () => {
    const out = component.htmlToText('Hello <b>world</b> <a href="#">lien</a>');
    expect(out).toContain('Hello world lien');
  });

  it('imgUrl uses url_m when present', () => {
    const out = component.imgUrl(selectedPhoto);
    expect(out).toBe('https://example.com/m.jpg');
    expect(flickr.buildPhotoUrl).not.toHaveBeenCalled();
  });

  it('thumbUrl falls back to buildPhotoUrl when no url_s/url_m', () => {
    const p = { ...selectedPhoto, url_s: undefined, url_m: undefined };
    const out = component.thumbUrl(p);
    expect(out).toBe('https://fallback.jpg');
    expect(flickr.buildPhotoUrl).toHaveBeenCalled();
  });

  it('ngOnChanges loads author photos and filters current photo', () => {
    flickr.getAuthorPublicPhotos.mockReturnValue(
      of({
        stat: 'ok',
        photos: {
          page: 1,
          pages: 1,
          perpage: 12,
          total: 2,
          photo: [{ ...selectedPhoto }, { ...selectedPhoto, id: 'p2' }],
        },
      })
    );

    flickr.getPhotoComments.mockReturnValue(of({ stat: 'ok', comments: { comment: [] } }));
    flickr.getPhotoLocation.mockReturnValue(of({ stat: 'fail', message: 'no location' }));

    component.selected = selectedPhoto;

    component.ngOnChanges({
      selected: {
        currentValue: selectedPhoto,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    } as any);

    expect(component.authorPhotosError).toBe('');
    expect(component.authorPhotos.map(p => p.id)).toEqual(['p2']);
  });

  it('ngOnChanges sets commentsError when comments request fails', () => {
    flickr.getAuthorPublicPhotos.mockReturnValue(
      of({
        stat: 'ok',
        photos: { page: 1, pages: 1, perpage: 12, total: 0, photo: [] },
      })
    );
    flickr.getPhotoLocation.mockReturnValue(of({ stat: 'fail', message: 'no location' }));

    flickr.getPhotoComments.mockReturnValue(throwError(() => new Error('Oops flickr don\'t want')));

    component.selected = selectedPhoto;

    component.ngOnChanges({
      selected: {
        currentValue: selectedPhoto,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    } as any);

    expect(component.commentsError).toContain('Oops flickr don\'t want');
  });
});
