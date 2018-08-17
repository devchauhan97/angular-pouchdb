import { TestBed, inject } from '@angular/core/testing';

import { PouchDBService } from './pouchdb.service';

describe('PouchDBService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PouchDBService]
    });
  });

  it('should be created', inject([PouchdbService], (service: PouchdbService) => {
    expect(service).toBeTruthy();
  }));
});
