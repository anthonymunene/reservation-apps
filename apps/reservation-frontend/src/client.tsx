import rest from '@feathersjs/rest-client';

import { createClient } from 'api';

const apiURL = 'http://localhost:3030';
const fetchConnection = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch;
const restClient = rest(apiURL);
export const api = createClient(restClient.fetch(fetchConnection));
