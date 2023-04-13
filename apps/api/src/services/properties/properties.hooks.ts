// @ts-nocheck

import { HookContext, NextFunction } from '../../declarations';

export const insertAmenity = async (context: HookContext, next: NextFunction) => {
  console.log(`Running hook create order on ${context.path}.${context.method}`);
  // try {
  const { amenities, ...data } = context.data;
  if (context.method === 'create') {
    // Code before `await next()` runs before the main function
    context.data = data;
    await next();
    const amenityData = amenities.map(amenity => ({
      propertyId: context?.result?.id,
      amenityId: amenity,
    }));

    const propertyAmenities = await context.app.service('propertyAmenities').create(amenityData);
    if (context.result) {
      const amenityIds = propertyAmenities.map(propertyAmenity => propertyAmenity.amenityId);
      const amenityNames = await context.app
        .service('amenities')
        .find({
          query: {
            id: {
              $in: amenityIds,
            },
            $select: ['name'],
          },
        })
        .then(result => result.data.map(result => result.name));
      const { result } = context;
      context.result = { ...result, ...{ amenities: amenityNames } };
    }
  }
};
