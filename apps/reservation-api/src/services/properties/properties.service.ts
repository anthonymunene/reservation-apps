// Initializes the `properties` service on path `/y`
import { Application } from '../../declarations';
import { Properties } from './properties.class';
import hooks from './properties.hooks';

export default function (app: Application) {
  const options = {
    model: 'property',
    client: app.get('prisma'),
    paginate: app.get('paginate'),
    whitelist: ['$rawWhere', '$eager'],
  };

  // Initialize our service with any options it requires
  app.use('/properties', new Properties(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('properties');

  // app.service('properties').find({
  //   query: {
  //     $eager: ['reviews', ['amenities', ['amenity']]],
  //   },
  // });

  // app.service('properties').get({
  //   query: {
  //     $eager: ['reviews', ['amenities', ['amenity']]],
  //   },
  // });

  service.hooks(hooks);
}
