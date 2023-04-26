import { HookContext, NextFunction } from '../../declarations';

export const insertAmenity = async (context: HookContext, next: NextFunction) => {
  console.log(`Running hook create order on ${context.path}.${context.method}`);
  // try {
  const { amenities, ...data } = context.data;
  if (context.method === 'create') {
    // Code before `await next()` runs before the main function
    context.data = data;
    await next();
    const amenityData = amenities.map((amenity: any) => ({
      propertyId: context?.result?.id,
      amenityId: amenity,
    }));

    await context.app.service('propertyAmenities').create(amenityData);
  }
};
