/**
 * Type definitions for Elasticsearch Suggesters
 * Derived from official @elastic/elasticsearch types for accuracy and completeness.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html
 */

import type {
  SearchTermSuggester,
  SearchPhraseSuggester,
  SearchCompletionSuggester
} from '@elastic/elasticsearch/lib/api/types';
import type { FieldTypeString } from './index-management.types.js';

/**
 * Options for term suggester — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#term-suggester
 */
export type TermSuggesterOptions = SearchTermSuggester;

/**
 * Options for phrase suggester — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#phrase-suggester
 */
export type PhraseSuggesterOptions = SearchPhraseSuggester;

/**
 * Options for completion suggester — re-exported from official @elastic/elasticsearch types
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#completion-suggester
 */
export type CompletionSuggesterOptions = SearchCompletionSuggester;

/**
 * Suggester state for build output
 */
export type SuggesterState = {
  [suggesterName: string]: {
    text?: string;
    prefix?: string;
    term?: TermSuggesterOptions;
    phrase?: PhraseSuggesterOptions;
    completion?: CompletionSuggesterOptions;
  };
};

/**
 * Suggester builder interface
 */
export type SuggesterBuilder<M extends Record<string, FieldTypeString>> = {
  /** Term suggester - suggests corrections for individual terms */
  term: (name: string, text: string, options: TermSuggesterOptions) => SuggesterBuilder<M>;

  /** Phrase suggester - suggests corrections for entire phrases */
  phrase: (name: string, text: string, options: PhraseSuggesterOptions) => SuggesterBuilder<M>;

  /** Completion suggester - autocomplete functionality */
  completion: (name: string, prefix: string, options: CompletionSuggesterOptions) => SuggesterBuilder<M>;

  /** Build suggester DSL */
  build: () => { suggest: SuggesterState };
};
