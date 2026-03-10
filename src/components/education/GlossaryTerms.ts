export const GLOSSARY = {
  ofac: {
    label: 'OFAC',
    definition:
      'The Office of Foreign Assets Control — a U.S. Treasury agency that administers economic sanctions. Businesses must screen counterparties against the OFAC SDN list before transacting.',
  },
  sdn: {
    label: 'SDN',
    definition:
      'Specially Designated Nationals list — the master OFAC list of sanctioned individuals, companies, and entities. A confirmed match requires immediate escalation.',
  },
  'jaro-winkler': {
    label: 'Jaro-Winkler',
    definition:
      'A string similarity algorithm that scores two names 0–1, giving extra weight to matching prefixes. Used to catch spelling variants of sanctioned names.',
  },
  'composite-score': {
    label: 'Composite Score',
    definition:
      'A weighted blend of three match algorithms: Jaro-Winkler (60%) + Double Metaphone (25%) + Token Sort Ratio (15%). Scores above the threshold trigger an alert.',
  },
  'false-positive': {
    label: 'False Positive',
    definition:
      'A name flagged as a potential SDN match that is actually a legitimate counterparty. High false positive rates create compliance workload without adding protection.',
  },
  'false-negative': {
    label: 'False Negative',
    definition:
      'A genuine SDN match that the screening engine missed — the most dangerous failure mode. Can result in a civil monetary penalty from OFAC.',
  },
  'risk-tier': {
    label: 'Risk Tier',
    definition:
      'One of five escalating alert levels (EXACT / HIGH / MEDIUM / LOW / CLEAR) assigned to each screened name based on its composite match score.',
  },
  'cost-of-miss': {
    label: 'Cost of Miss',
    definition:
      "Estimated OFAC civil penalty if a false negative allows a sanctioned transaction to proceed. Calculated as transaction value × 4.0 (OFAC's standard penalty multiplier).",
  },
  threshold: {
    label: 'Threshold',
    definition:
      'The composite score cutoff above which a name is flagged for review. Lower threshold = fewer false negatives but more false positives.',
  },
  'double-metaphone': {
    label: 'Double Metaphone',
    definition:
      'A phonetic encoding algorithm that converts names to their sound representation, catching matches like "Smith" and "Smyth" that differ in spelling but sound identical.',
  },
  'token-sort-ratio': {
    label: 'Token Sort Ratio',
    definition:
      'A fuzzy match technique that sorts name tokens alphabetically before comparing — catching matches like "Al Rashid Omar" vs "Omar Al Rashid".',
  },
} as const;

export type GlossaryKey = keyof typeof GLOSSARY;
