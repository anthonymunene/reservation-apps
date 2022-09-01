const getOwnedProperties = () => {
  return async (context) => {
    const { app, method, result, params } = context;
    if (params.runHook !== false) {
      const addOwnedProperties = async (message) => {
        // console.log(message.id);
        const user = await app.service("users").get(message.id, {
          runHook: false,
          query: {
            $eager: ["properties"],
          },
        });
        let { properties } = user;
        return {
          ...message,
          properties: properties.map((property) => ({ id: property?.id })),
        };
      };
      // In a find method we need to process the entire page
      if (method === "find") {
        // Map all data to include the `user` information
        context.result.data = await Promise.all(
          result.data.map(addOwnedProperties)
        );
      } else {
        context.result = await addOwnedProperties(result);
      }
    }
    return context;
  };
};

const getProfile = () => {
  return async (context) => {
    const { app, method, result, params } = context;
    if (params.runHook !== false) {
      const fetchProfile = async (message) => {
        const user = await app.service("users").get(message.id, {
          runHook: false,
          query: {
            $eager:['profile']
          },
        });
        let { profile } = user;
        return {
          ...message,
          profile,
        };
      };
      if (method == "find") {
        context.result.data = await Promise.all(
          result.data.map(fetchProfile)
        );
      } else {
        context.result = await fetchProfile(result)
      }
      return context;
    }
  };
};

module.exports = {
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
    find: [getOwnedProperties(), getProfile()],
    get: [getOwnedProperties(), getProfile()],
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
