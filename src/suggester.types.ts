/**
 * Type definitions for Elasticsearch Suggesters
 * Derived from official @elastic/elasticsearch types for accuracy and completeness.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html
 */

import type {
  SearchTermSuggester,
  SearchPhraseSuggester,
  SearchCompletionSuggester,
  SearchDirectGenerator,
  SearchPhraseSuggestCollate,
  SearchSmoothingModelContainer,
  SearchCompletionContext
} from '@elastic/elasticsearch/lib/api/types';

/**
 * Phrase suggester direct-generator config — re-exported from official @elastic/elasticsearch types.
 * Used in `PhraseSuggesterOptions.direct_generator`.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#phrase-suggester
 */
export type PhraseSuggestDirectGenerator = SearchDirectGenerator;

/**
 * Phrase suggester collate config — re-exported from official @elastic/elasticsearch types.
 * Used in `PhraseSuggesterOptions.collate` to run a query against each candidate phrase.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#_collate
 */
export type PhraseSuggestCollate = SearchPhraseSuggestCollate;

/**
 * Phrase suggester smoothing-model container — re-exported from official @elastic/elasticsearch types.
 * Used in `PhraseSuggesterOptions.smoothing`.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#_smoothing_models
 */
export type PhraseSuggestSmoothingModel = SearchSmoothingModelContainer;

/**
 * Completion suggester context — re-exported from official @elastic/elasticsearch types.
 * Used in `CompletionSuggesterOptions.contexts`.
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/suggester-context.html
 */
export type CompletionSuggestContext = SearchCompletionContext;
import type { FieldTypeString } from './index-management.types.js';
import type { TextFields, KeywordFields, CompletionFields } from './mapping.types.js';

/**
 * Options for term suggester — mirrors the official `SearchTermSuggester` type.
 * `field`, `text`, and `prefix` are omitted because they are supplied by the builder
 * as explicit arguments (`field` is re-added below, narrowed to the mapping schema).
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#term-suggester
 */
export type TermSuggesterOptions<M extends Record<string, FieldTypeString>> = Omit<
  SearchTermSuggester,
  'field' | 'text' | 'prefix'
> & {
  field: (TextFields<M> | KeywordFields<M>) & string;
};

/**
 * Options for phrase suggester — mirrors the official `SearchPhraseSuggester` type
 * with `field`, `text`, and `prefix` removed (builder-owned).
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#phrase-suggester
 */
export type PhraseSuggesterOptions<M extends Record<string, FieldTypeString>> = Omit<
  SearchPhraseSuggester,
  'field' | 'text' | 'prefix'
> & {
  field: (TextFields<M> | KeywordFields<M>) & string;
};

/**
 * Options for completion suggester — mirrors the official `SearchCompletionSuggester` type
 * with `field`, `text`, and `prefix` removed (builder-owned).
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html#completion-suggester
 */
export type CompletionSuggesterOptions<M extends Record<string, FieldTypeString>> = Omit<
  SearchCompletionSuggester,
  'field' | 'text' | 'prefix'
> & {
  field: CompletionFields<M> & string;
};

/**
 * Suggester state for build output.
 *
 * The state carries the suggester DSL as Elasticsearch accepts it — options still
 * embed `field` internally after the builder writes them, since that is how the
 * underlying wire format works. The type-safety benefit lives at the method
 * boundary: callers cannot pass a non-existent field to `.term()`/`.phrase()`/`.completion()`.
 */
export type SuggesterState = {
  [suggesterName: string]: {
    text?: string;
    prefix?: string;
    term?: Omit<SearchTermSuggester, 'text' | 'prefix'>;
    phrase?: Omit<SearchPhraseSuggester, 'text' | 'prefix'>;
    completion?: Omit<SearchCompletionSuggester, 'text' | 'prefix'>;
  };
};

/**
 * Suggester builder interface
 */
export type SuggesterBuilder<M extends Record<string, FieldTypeString>> = {
  /** Term suggester - suggests corrections for individual terms */
  term: (name: string, text: string, options: TermSuggesterOptions<M>) => SuggesterBuilder<M>;

  /** Phrase suggester - suggests corrections for entire phrases */
  phrase: (name: string, text: string, options: PhraseSuggesterOptions<M>) => SuggesterBuilder<M>;

  /** Completion suggester - autocomplete functionality */
  completion: (name: string, prefix: string, options: CompletionSuggesterOptions<M>) => SuggesterBuilder<M>;

  /** Build suggester DSL */
  build: () => { suggest: SuggesterState };
};
