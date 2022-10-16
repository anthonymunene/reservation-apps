import { Hook, HookContext } from '@feathersjs/feathers';
import excludeFrom from '../../utils/excludeFrom';
import { DEFAULT_EXCLUSIONS } from '../../utils/variables';
const withRelations = (): Hook => {
  return async (context: HookContext) => {
    const { app, method, result, params } = context;
    if (params.runHook !== false) {
      const addRelations = async (message: any) => {
        const user = await app.service('users').get(message.id, {
          runHook: false,
          query: {
            $eager: ['properties', 'profile'],
          },
        });
        const { profile, properties } = user;

        const result = excludeFrom(message, DEFAULT_EXCLUSIONS);
        return {
          ...result,
          profile: excludeFrom(profile,[...DEFAULT_EXCLUSIONS, 'id']),
          properties: properties.map((property: any) => ({ id: property?.id })),
        };
      };
      // In a find method we need to process the entire page
      if (method === 'find') {
        // Map all data to include the `user` information
        context.result.data = await Promise.all(
          result.data.map(addRelations)
        );
      } else {
        context.result = await addRelations(result);
      }
    }
    return context;
  };
};


export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [withRelations()],
    get: [withRelations()],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
