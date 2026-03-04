// Type shim for talisman deep import (no official @types/talisman package).
// talisman/metrics/jaro-winkler exports the jaroWinkler function as default.
declare module 'talisman/metrics/jaro-winkler' {
  const jaroWinkler: (a: string, b: string) => number;
  export default jaroWinkler;
}
