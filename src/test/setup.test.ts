import { describe, it, expect } from 'vitest';

describe('Vitest Setup', () => {
  it('should run tests correctly', () => {
    expect(true).toBe(true);
  });

  it('should have access to expect', () => {
    expect(1 + 1).toBe(2);
  });
});
