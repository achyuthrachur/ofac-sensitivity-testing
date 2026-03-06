// src/data/clientNames.ts
// Pre-loaded synthetic client name list for Screening Mode demo.
//
// Composition (50 names total):
//   12 near-matches to SDN entries → expect EXACT or HIGH tier
//   28 clearly unrelated names     → expect CLEAR tier
//   10 edge cases                  → exercise algorithm guards and penalties
//
// Names are designed to produce a representative result spread against the
// 290-entry SDN dataset in data/sdn.json.
// Do NOT sort or reorder — the ordering is intentional for demo narrative.

export const CLIENT_NAMES: string[] = [
  // ── Near-matches to SDN entries (expect EXACT or HIGH tier) ──────────────
  'HASSAN IBN ALI AL-RASHIDI',
  'AHMAD KHALID AL-MASRI',
  'ZHANG WEI',
  'IGOR PETROV',
  'HASSAN AL RASHIDI',
  'AL-RASHIDI HASSAN',
  'SERGEI IVANOV',
  'WANG JIANGUO',
  'CARLOS RODRIGUEZ',
  'AL-ZARQAWI ABU MUSAB',
  'LI HONG MEI',
  'DMITRI VOLKOV',

  // ── Clearly unrelated names (expect CLEAR tier) ───────────────────────────
  'ACME FINANCIAL CORP',
  'NORTHERN TRUST ADVISORS LLC',
  'JAMES WORTHINGTON',
  'SARAH CHEN',
  'MICHAEL OKONKWO',
  'DEUTSCHE BANK AG',
  'SUNRISE CAPITAL PARTNERS',
  'BLUE RIDGE INVESTMENT GROUP',
  'MARGARET HOLLOWAY',
  'WILLIAM FITZGERALD',
  'TOKYO ELECTRONICS LTD',
  'PARIS ASSET MANAGEMENT',
  'NORDIC SHIPPING AS',
  'GLOBAL TRADE SOLUTIONS INC',
  'AMANDA MORRISON',
  'CHRISTOPHER PATEL',
  'SUMMIT INFRASTRUCTURE FUND',
  'CLEARWATER LEASING CO',
  'JENNIFER NAKAMURA',
  'ROBERT KOWALSKI',
  'PACIFIC COAST VENTURES',
  'ATLANTIC MERIDIAN BANK',
  'HANNAH GOLDSTEIN',
  'ETHAN BLACKWOOD',
  'SUNRISE MARITIME GROUP',
  'CONTINENTAL HOLDINGS PLC',
  'RIVER VALLEY EXPORTS',
  'ALPINE CREDIT UNION',

  // ── Edge cases (test algorithm guards and length penalty) ─────────────────
  'AL',
  'ALI',
  'LI',
  'IRAN BANK',
  'BANK OF HASSAN',
  'TRADING CORP INTERNATIONAL',
  'EP-TQA',
  'SEA EAGLE SHIPPING',
  'EVER HORIZON',
  'ATLANTIC SPIRIT MARITIME',
];
