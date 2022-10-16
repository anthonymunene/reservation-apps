import { Application } from '../../declarations';

// Initializes the `users` service on path `/y`
import { Users } from './users.class';
import hooks from './users.hooks';

export default function (app: Application) {
  const options = {
    model: 'user',
    client: app.get('prisma'),
    paginate: app.get('paginate'),
    whitelist: ['$rawWhere', '$eager'],
  };

  // Initialize our service with any options it requires
  app.use('/users', new Users(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('users');

  service.hooks(hooks);
}
