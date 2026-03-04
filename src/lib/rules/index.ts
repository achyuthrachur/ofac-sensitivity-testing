// src/lib/rules/index.ts
// Public API for the transformation engine.
// Phase 4 (Server Action) imports ONLY from this file — not from individual rule files.
// Individual rule functions are internals; consumers use ruleMap[ruleId](entry).

import type { SdnEntry } from '@/types';

import { spaceRemoval } from './space-removal';
import { charSubstitution } from './char-substitution';
import { diacritic } from './diacritic';
import { wordReorder } from './word-reorder';
import { abbreviation } from './abbreviation';
import { truncation } from './truncation';
import { phonetic } from './phonetic';
import { punctuation } from './punctuation';
import { prefixSuffix } from './prefix-suffix';
import { alias } from './alias';

/**
 * All valid degradation rule identifiers.
 * Matches the CANONICAL_RULE_ORDER array below.
 */
export type RuleId =
  | 'space-removal'
  | 'char-substitution'
  | 'diacritic'
  | 'word-reorder'
  | 'abbreviation'
  | 'truncation'
  | 'phonetic'
  | 'punctuation'
  | 'prefix-suffix'
  | 'alias';

/** Function signature every rule implements. */
export type RuleFunction = (entry: SdnEntry) => string | null;

/**
 * Fixed execution order for all degradation rules.
 * Engine applies rules in this order, regardless of user checkbox order.
 * Ensures identical output for identical RunParams (determinism contract).
 */
export const CANONICAL_RULE_ORDER: RuleId[] = [
  'space-removal',
  'char-substitution',
  'diacritic',
  'word-reorder',
  'abbreviation',
  'truncation',
  'phonetic',
  'punctuation',
  'prefix-suffix',
  'alias',
];

/**
 * Human-readable display labels for each rule.
 * Phase 5 (Parameter Form) uses this to populate the rule checkbox list.
 * Phase 6 (Results Table) uses this for the 'Rule Applied' column.
 */
export const RULE_LABELS: Record<RuleId, string> = {
  'space-removal': 'Space Removal',
  'char-substitution': 'OCR/Leet Substitution',
  'diacritic': 'Diacritic Removal',
  'word-reorder': 'Word Reorder',
  'abbreviation': 'Abbreviation',
  'truncation': 'Truncation',
  'phonetic': 'Phonetic Variant',
  'punctuation': 'Punctuation',
  'prefix-suffix': 'Prefix/Suffix Removal',
  'alias': 'Alias Substitution',
};

/**
 * Rule function lookup map.
 * Usage: ruleMap[ruleId](entry) — returns string | null.
 * Returns null if the rule is not applicable to the entry's script/region.
 * Phase 4 skips null results (no ResultRow generated for inapplicable pairs).
 */
export const ruleMap: Record<RuleId, RuleFunction> = {
  'space-removal': spaceRemoval,
  'char-substitution': charSubstitution,
  'diacritic': diacritic,
  'word-reorder': wordReorder,
  'abbreviation': abbreviation,
  'truncation': truncation,
  'phonetic': phonetic,
  'punctuation': punctuation,
  'prefix-suffix': prefixSuffix,
  'alias': alias,
};
