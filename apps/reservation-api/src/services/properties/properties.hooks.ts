import { Hook, HookContext } from '@feathersjs/feathers';
import excludeFrom from '../../utils/excludeFrom';
import { DateTime } from 'luxon';
import { STANDARD_FORMAT } from '../../utils/date';
import { DEFAULT_EXCLUSIONS } from '../../utils/variables';

const withRelations = (): Hook => {
  return async (context: HookContext) => {
    const { app, method, result, params } = context;
    if (params.runHook !== false) {
      const fetchRelations = async (message: any) => {
        const property = await app.service('properties').get(message.id, {
          runHook: false,
          query: {
            $eager: ['reviews', ['amenities', ['amenity']]],
          },
        });
        const reviews = property.reviews.map(
          ({ comment, rating, createdAt }: any) => {
            const date = DateTime.fromISO(createdAt.toISOString()).toFormat(
              STANDARD_FORMAT
            );
            return {
              comment,
              rating,
              date,
            };
          }
        );
        const amenities = property.amenities.map(
          (amenity:any) => amenity.amenity.name
        );
        const exclusions: string[] = [
          ...DEFAULT_EXCLUSIONS,
          'propertyTypeId',
          'hostId'
        ];
        const result = excludeFrom(message, exclusions);
        return {
          ...result,
          reviews,
          amenities,
        };
      };
      console.log(`METHOD IS ${method}`);
      // In a find method we need to process the entire page
      if (method === 'find') {
        // Map all data to include the `user` information
        context.result.data = await Promise.all(
          result.data.map(fetchRelations)
        );
      } else {
        context.result = await fetchRelations(result);
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
