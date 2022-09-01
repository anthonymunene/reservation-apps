const exclude = require('../../utils/exclude.js')
const withAmenities = () => {
  return async (context) => {
    const { app, method, result, params } = context;
    if (params.runHook !== false) {
      const fetchAmenities = async (message) => {
        const property = await app.service("properties").get(message.id, {
          runHook: false,
          query: {
            $eager: [["amenities", ["amenity"]]],
          },
        });
        const amenities = property.amenities.map(
          (amenity) => amenity.amenity.name
        );
        const result = exclude(property,['propertyTypeId','hostId', 'createdAt', 'updatedAt'] )
        return {
          ...result,
          amenities,
        };
      };
      console.log(`METHOD IS ${method}`);
      // In a find method we need to process the entire page
      if (method === "find") {
        // Map all data to include the `user` information
        context.result.data = await Promise.all(
          result.data.map(fetchAmenities)
        );
      } else {
        context.result = await fetchAmenities(result);
      }
    }
    return context;
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
    find: [withAmenities()],
    get: [withAmenities()],
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
