// src/lib/workers/screening.worker.ts
// Web Worker entry point — Comlink-exposed API for off-main-thread screening.
//
// CRITICAL: Do NOT import @data/sdn.json here. The @data/* alias fails in the
// worker bundler. SDN data comes from the main thread via the sdnEntries argument.

import * as Comlink from 'comlink';
import type { ScreeningWorkerApi } from '@/types/screening';
import type { SdnEntry } from '@/types';
import { screenNames as doScreenNames } from '@/lib/screening/scorer';

/** Type guard: verify that an unknown value has the SdnEntry shape. */
function isSdnEntry(e: unknown): e is SdnEntry {
  return (
    typeof e === 'object' &&
    e !== null &&
    typeof (e as Record<string, unknown>).id === 'string' &&
    typeof (e as Record<string, unknown>).name === 'string' &&
    typeof (e as Record<string, unknown>).entityType === 'string' &&
    typeof (e as Record<string, unknown>).region === 'string'
  );
}

const workerApi: ScreeningWorkerApi = {
  async screenNames(inputNames: string[], sdnEntries: unknown[]) {
    const entries = sdnEntries.filter(isSdnEntry);
    return doScreenNames(inputNames, entries);
  },
};

Comlink.expose(workerApi);
