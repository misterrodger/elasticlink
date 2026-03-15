import type { Matter, Attorney } from './legal.schema.js';

export const MATTERS: Matter[] = [
  {
    matter_id: 'M-1001',
    title: 'Mergers & Acquisitions Advisory',
    practice_area: 'corporate',
    billing_rate: 850,
    risk_score: 3.2,
    opened_at: '2023-01-10'
  },
  {
    matter_id: 'M-1002',
    title: 'SEC Enforcement Defense',
    practice_area: 'securities',
    billing_rate: 920,
    risk_score: 4.7,
    opened_at: '2023-05-22'
  },
  {
    matter_id: 'M-1003',
    title: 'Patent Infringement Litigation',
    practice_area: 'intellectual-property',
    billing_rate: 780,
    risk_score: 3.9,
    opened_at: '2022-08-14'
  },
  {
    matter_id: 'M-1004',
    title: 'Commercial Real Estate Finance',
    practice_area: 'real-estate',
    billing_rate: 620,
    risk_score: 2.1,
    opened_at: '2021-11-03'
  }
];

export const ATTORNEYS: Attorney[] = [
  {
    name: 'Sarah Chen',
    practice_area: 'corporate',
    name_suggest: { input: ['Sarah Chen', 'Chen'] }
  },
  {
    name: 'Marcus Williams',
    practice_area: 'securities',
    name_suggest: { input: ['Marcus Williams', 'Williams'] }
  },
  {
    name: 'Priya Kapoor',
    practice_area: 'intellectual-property',
    name_suggest: { input: ['Priya Kapoor', 'Kapoor'] }
  },
  {
    name: 'James Okafor',
    practice_area: 'real-estate',
    name_suggest: { input: ['James Okafor', 'Okafor'] }
  }
];
