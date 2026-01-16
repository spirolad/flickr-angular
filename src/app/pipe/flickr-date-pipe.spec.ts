import { FlickrDatePipe } from './flickr-date-pipe';

describe('FlickrDatePipe', () => {
  let pipe: FlickrDatePipe;

  beforeEach(() => {
    pipe = new FlickrDatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format a unix timestamp', () => {
    const timestamp = 1768472602;

    const result = pipe.transform(timestamp);

    expect(result).toBe('15 janvier 2026');
  });

  it('should return empty string for NaN value', () => {
    const result = pipe.transform('not-a-number');

    expect(result).toBe('');
  });

  it('should return empty string for null', () => {
    const result = pipe.transform(null);

    expect(result).toBe('');
  });

  it('should return empty string for undefined', () => {
    const result = pipe.transform(undefined);

    expect(result).toBe('');
  });

  it('should return a valid date for timestamp 0', () => {
    const result = pipe.transform(0);

    expect(result).toBe('1 janvier 1970');
  });
});
