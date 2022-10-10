import { TestBed, async, inject } from '@angular/core/testing';

import { ExportGuard } from './export.guard';

describe('ExportGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExportGuard]
    });
  });

  it('should ...', inject([ExportGuard], (guard: ExportGuard) => {
    expect(guard).toBeTruthy();
  }));
});
