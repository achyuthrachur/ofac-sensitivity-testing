// Type shim for talisman deep import (no official @types/talisman package).
// talisman/metrics/jaro-winkler exports the jaroWinkler function as default.
declare module 'talisman/metrics/jaro-winkler' {
  const jaroWinkler: (a: string, b: string) => number;
  export default jaroWinkler;
}

declare module 'talisman/phonetics/double-metaphone' {
  /**
   * Computes the Double Metaphone phonetic code for an English word.
   * Returns [primaryCode, secondaryCode] — both max 4 uppercase ASCII chars.
   * English-optimized. Returns ['', ''] for non-Latin/CJK/Arabic inputs.
   * Use this for phonetic near-match detection in Phase 16.
   */
  const doubleMetaphone: (word: string) => [string, string];
  export default doubleMetaphone;
}
