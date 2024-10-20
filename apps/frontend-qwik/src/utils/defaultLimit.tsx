import type { RequestEventLoader } from '@builder.io/qwik-city';

export const defaultLimit = (requestEvent: RequestEventLoader) => {
  const queryBuilder = requestEvent.query;
  const defaultLimit = Number(queryBuilder.get('limit') ? queryBuilder.get('limit') : requestEvent.env.get('LIMIT'));

  return defaultLimit;
};
