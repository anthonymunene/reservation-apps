import { propertyTypes } from './propertyTypes/propertyTypes';
import { propertyAmenities } from './propertyAmenities/propertyAmenities';
import { amenities } from './amenities/amenities';
import { reviews } from './reviews/reviews';
import { profiles } from './profiles/profiles';
import { properties } from './properties/properties';
import { users } from './users/users';
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations';

export const services = (app: Application) => {
  app.configure(propertyTypes);
  app.configure(propertyAmenities);
  app.configure(amenities);
  app.configure(reviews);
  app.configure(profiles);
  app.configure(properties);
  app.configure(users);
  // All services will be registered here
};
