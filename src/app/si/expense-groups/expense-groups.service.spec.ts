import { TestBed } from '@angular/core/testing';

import { ExpenseGroupsService } from '../../core/services/expense-groups.service';

describe('ExpenseGroupsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExpenseGroupsService = TestBed.get(ExpenseGroupsService);
    expect(service).toBeTruthy();
  });
});
