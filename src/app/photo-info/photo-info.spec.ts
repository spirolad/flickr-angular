import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoInfo } from './photo-info';

describe('PhotoInfo', () => {
  let component: PhotoInfo;
  let fixture: ComponentFixture<PhotoInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
