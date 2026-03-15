import { mappings, keyword, text, integer, float, date, completion } from '../../index.js';
import type { Infer } from '../../index.js';

export const matterMappings = mappings({
  matter_id: keyword(),
  title: text(),
  practice_area: keyword(),
  billing_rate: integer(),
  risk_score: float(),
  opened_at: date()
});

export type Matter = Infer<typeof matterMappings>;

export const attorneyMappings = mappings({
  name: text(),
  practice_area: keyword(),
  name_suggest: completion()
});

export type Attorney = Infer<typeof attorneyMappings>;
