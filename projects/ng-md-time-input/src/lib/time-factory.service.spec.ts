import { TestBed, inject } from '@angular/core/testing';
import { TimeFactoryService } from './time-factory.service';
// Moment
import { utc, invalid } from "moment";

describe('TimeFactoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeFactoryService]
    });
  });

  it('should be created', inject([TimeFactoryService], (service: TimeFactoryService) => {
    expect(service).toBeTruthy();
  }));

  it('should reset the time to the beginning of the given day if the time is valid',
    inject([TimeFactoryService], (service: TimeFactoryService) => {
      const timeObject = utc().set({ year: 1999, month: 10, day: 6, hours: 23, minutes: 59, second: 59, millisecond: 10 });
      const expectedResult = utc().set({ year: 1999, month: 10, day: 6, hours: 0, minutes: 0, second: 0, millisecond: 0 });

      const result = service.resetTime(timeObject);
      expect(expectedResult.valueOf()).toEqual(result.valueOf());
    }));

  it('should reset the time to the beginning of today if the time is invalid',
    inject([TimeFactoryService], (service: TimeFactoryService) => {
      const timeObject = invalid();
      const expectedResult = utc().set({ hours: 0, minutes: 0, second: 0, millisecond: 0 });

      const result = service.resetTime(timeObject, true);
      expect(expectedResult.valueOf()).toEqual(result.valueOf());
    }));
});
