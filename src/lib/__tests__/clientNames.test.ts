import { describe, it, expect } from 'vitest';
import { CLIENT_NAMES } from '@/data/clientNames';

describe('CLIENT_NAMES', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(CLIENT_NAMES)).toBe(true);
    expect(CLIENT_NAMES.length).toBeGreaterThan(0);
  });

  it('contains exactly 50 names', () => {
    expect(CLIENT_NAMES.length).toBe(50);
  });

  it('every entry is a non-empty string', () => {
    CLIENT_NAMES.forEach((name, i) => {
      expect(typeof name, `index ${i}`).toBe('string');
      expect(name.trim().length, `index ${i} is empty`).toBeGreaterThan(0);
    });
  });

  it('every entry is under 200 characters', () => {
    CLIENT_NAMES.forEach((name, i) => {
      expect(name.length, `index ${i} too long`).toBeLessThanOrEqual(200);
    });
  });

  it('count is within the screening limit', () => {
    expect(CLIENT_NAMES.length).toBeLessThanOrEqual(10_000);
  });

  it('has no duplicate entries', () => {
    const unique = new Set(CLIENT_NAMES);
    expect(unique.size).toBe(CLIENT_NAMES.length);
  });
});
