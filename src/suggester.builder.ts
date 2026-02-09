/**
 * Suggester builder
 * Provides query suggestions, phrase corrections, and autocomplete functionality
 */

import { SuggesterBuilder, SuggesterState } from './suggester.types.js';

/**
 * Creates a suggester builder
 * @returns SuggesterBuilder instance
 */
export const createSuggesterBuilder = <T>(
  state: SuggesterState = {}
): SuggesterBuilder<T> => ({
  term: (name, text, options) => {
    return createSuggesterBuilder<T>({
      ...state,
      [name]: {
        text,
        term: options
      }
    });
  },

  phrase: (name, text, options) => {
    return createSuggesterBuilder<T>({
      ...state,
      [name]: {
        text,
        phrase: options
      }
    });
  },

  completion: (name, prefix, options) => {
    return createSuggesterBuilder<T>({
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
 * const suggestions = suggest<Product>()
 *   .term('name-suggestions', 'laptop', { field: 'name', size: 5 })
 *   .build();
 * ```
 */
export const suggest = <T>() => createSuggesterBuilder<T>();
