export type Matter = {
  matter_id: string;
  title: string;
  practice_area: string;
  billing_rate: number;
};

export const MATTERS: Matter[] = [
  {
    matter_id: 'M-1001',
    title: 'Mergers & Acquisitions Advisory',
    practice_area: 'corporate',
    billing_rate: 850
  },
  {
    matter_id: 'M-1002',
    title: 'SEC Compliance Review',
    practice_area: 'securities',
    billing_rate: 725
  },
  {
    matter_id: 'M-1003',
    title: 'IP Portfolio Audit',
    practice_area: 'intellectual-property',
    billing_rate: 650
  }
];
