/* eslint-disable @typescript-eslint/no-explicit-any */

const ES_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

export type EsRequest = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path?: string;
  body?: any;
};

const esJson = (url: string, method: string, body?: any): Promise<any> =>
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) })
  }).then((r) => r.json());

const esNdjson = (url: string, body: string): Promise<any> =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-ndjson' },
    body
  }).then((r) => r.json());

export const createIndex = (index: string, config: any) => esJson(`${ES_URL}/${index}`, 'PUT', config);

export const deleteIndex = (index: string) => esJson(`${ES_URL}/${index}`, 'DELETE');

export const refreshIndex = (index: string) => esJson(`${ES_URL}/${index}/_refresh`, 'POST');

export const search = (index: string, body: any) => esJson(`${ES_URL}/${index}/_search`, 'POST', body);

export const indexDoc = (index: string, body: any) => esJson(`${ES_URL}/${index}/_doc`, 'POST', body);

export const bulkRequest = (ndjson: string) => esNdjson(`${ES_URL}/_bulk`, ndjson);

export const msearchRequest = (index: string, ndjson: string) => esNdjson(`${ES_URL}/${index}/_msearch`, ndjson);

export const esGet = (path: string) => esJson(`${ES_URL}${path}`, 'GET');

export const esPost = (path: string, body?: any) => esJson(`${ES_URL}${path}`, 'POST', body);
