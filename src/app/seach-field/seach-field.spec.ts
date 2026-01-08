import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeachField } from './seach-field';

describe('SeachField', () => {
  let component: SeachField;
  let fixture: ComponentFixture<SeachField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeachField]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeachField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
