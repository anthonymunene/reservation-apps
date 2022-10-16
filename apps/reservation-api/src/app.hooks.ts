// Application hooks that run for every service
// Don't remove this comment. It's needed to format import lines nicely.
import { Hook, HookContext } from '@feathersjs/feathers';


const withError = (): Hook => {
  return async (context: HookContext) => {
    const { app, method, result, params } = context;

    console.log(JSON.stringify(params));

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
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [withError()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
