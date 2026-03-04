import { describe, it, expect } from 'vitest';
import { sampleEntries } from '@/lib/sampler';
import type { SdnEntry, RunParams } from '@/types';

// Minimal fixture dataset — does NOT use real sdn.json (keeps tests fast and deterministic)
function makeFixtureData(): SdnEntry[] {
  const entries: SdnEntry[] = [];
  // 10 arabic individuals
  for (let i = 0; i < 10; i++) {
    entries.push({ id: `ara-ind-${i}`, name: `ARABIC INDIVIDUAL ${i}`, entityType: 'individual', region: 'arabic' });
  }
  // 10 latin individuals
  for (let i = 0; i < 10; i++) {
    entries.push({ id: `lat-ind-${i}`, name: `LATIN INDIVIDUAL ${i}`, entityType: 'individual', region: 'latin' });
  }
  // 10 arabic businesses
  for (let i = 0; i < 10; i++) {
    entries.push({ id: `ara-biz-${i}`, name: `ARABIC BUSINESS ${i}`, entityType: 'business', region: 'arabic' });
  }
  // 10 latin businesses
  for (let i = 0; i < 10; i++) {
    entries.push({ id: `lat-biz-${i}`, name: `LATIN BUSINESS ${i}`, entityType: 'business', region: 'latin' });
  }
  return entries;
}

describe('sampleEntries', () => {
  const data = makeFixtureData();

  it('returns correct total count', () => {
    const params: RunParams = {
      entityCounts: { individual: 5, business: 3, vessel: 0, aircraft: 0 },
      regions: ['arabic', 'latin'],
      ruleIds: [],
      clientName: 'test',
    };
    const result = sampleEntries(data, params);
    expect(result).toHaveLength(8);
  });

  it('returns correct entity type distribution', () => {
    const params: RunParams = {
      entityCounts: { individual: 5, business: 3, vessel: 0, aircraft: 0 },
      regions: ['arabic', 'latin'],
      ruleIds: [],
      clientName: 'test',
    };
    const result = sampleEntries(data, params);
    const individuals = result.filter((e) => e.entityType === 'individual');
    const businesses = result.filter((e) => e.entityType === 'business');
    expect(individuals).toHaveLength(5);
    expect(businesses).toHaveLength(3);
  });

  it('is deterministic: same seed produces same result', () => {
    const params: RunParams = {
      entityCounts: { individual: 5, business: 3, vessel: 0, aircraft: 0 },
      regions: ['arabic', 'latin'],
      ruleIds: [],
      clientName: 'test',
    };
    const result1 = sampleEntries(data, params, 42);
    const result2 = sampleEntries(data, params, 42);
    expect(result1.map((e) => e.id)).toEqual(result2.map((e) => e.id));
  });

  it('filters by regions — arabic only yields only arabic entries', () => {
    const params: RunParams = {
      entityCounts: { individual: 5, business: 0, vessel: 0, aircraft: 0 },
      regions: ['arabic'],
      ruleIds: [],
      clientName: 'test',
    };
    const result = sampleEntries(data, params);
    expect(result.every((e) => e.region === 'arabic')).toBe(true);
  });

  it('returns empty array when all counts are zero', () => {
    const params: RunParams = {
      entityCounts: { individual: 0, business: 0, vessel: 0, aircraft: 0 },
      regions: ['arabic', 'latin'],
      ruleIds: [],
      clientName: 'test',
    };
    const result = sampleEntries(data, params);
    expect(result).toHaveLength(0);
  });
});
