// src/lib/workers/screening.worker.ts
// Web Worker entry point — Comlink-exposed API for off-main-thread screening.
//
// CRITICAL: Do NOT import @data/sdn.json here. The tsconfig @data/* alias
// may not resolve inside the worker bundler entry. The main thread imports
// SDN data and passes it as a message payload via the screenNames argument.
//
// Phase 15: stub implementation — Phase 16 replaces the throw with real logic.

import * as Comlink from 'comlink';
import type { ScreeningWorkerApi, MatchResultStub } from '@/types/screening';

const workerApi: ScreeningWorkerApi = {
  async screenNames(
    _inputNames: string[],
    _sdnEntries: unknown[]
  ): Promise<MatchResultStub[]> {
    throw new Error('screenNames: Not implemented — Phase 16');
  },
};

Comlink.expose(workerApi);
