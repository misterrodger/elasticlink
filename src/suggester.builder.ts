/**
 * Suggester builder
 * Provides query suggestions, phrase corrections, and autocomplete functionality
 */

import type { FieldTypeString } from './index-management.types.js';
import type { MappingsSchema } from './mapping.types.js';
import { SuggesterBuilder, SuggesterState } from './suggester.types.js';

/**
 * Creates a suggester builder
 * @returns SuggesterBuilder instance
 */
export const createSuggesterBuilder = <
  M extends Record<string, FieldTypeString>
>(
  state: SuggesterState = {}
): SuggesterBuilder<M> => ({
  term: (name, text, options) => {
    return createSuggesterBuilder<M>({
      ...state,
      [name]: {
        text,
        term: options
      }
    });
  },

  phrase: (name, text, options) => {
    return createSuggesterBuilder<M>({
      ...state,
      [name]: {
        text,
        phrase: options
      }
    });
  },

  completion: (name, prefix, options) => {
    return createSuggesterBuilder<M>({
      ...state,
      [name]: {
        prefix,
        completion: options
      }
    });
  },

  build: () => ({
    suggest: state
  })
});

/**
 * Factory function to create a new suggester builder
 * @example
 * ```typescript
 * const suggestions = suggest(productMappings)
 *   .term('name-suggestions', 'laptop', { field: 'name', size: 5 })
 *   .build();
 * ```
 */
export const suggest = <M extends Record<string, FieldTypeString>>(
  _schema: MappingsSchema<M>
) => createSuggesterBuilder<M>();
