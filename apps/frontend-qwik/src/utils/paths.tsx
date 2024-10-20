export const paths = {
  index: '/',
  properties: '/properties',
  property: (id: string) => `/properties/${id}`,
  notFound: '/404',
  user: (id: string) => `/users/${id}`,
  users: '/users',
};
