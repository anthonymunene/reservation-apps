import { Application } from '../../declarations';
import multer from 'multer';

import { Users } from './users.class';
import hooks from './users.hooks';

const formDataMiddleware = multer();

export default function (app: Application) {
  const options = {
    model: 'user',
    client: app.get('prisma'),
    paginate: app.get('paginate'),
    whitelist: ['$rawWhere', '$eager'],
  };

  // Initialize our service with any options it requires
  app.use('/users', formDataMiddleware.single('profilepic'), function (req , res, next) {
    req.feathers.files = req.files;
    next();
  },
  new Users(options, app)
  );

  // Get our initialized service so that we can register hooks
  const service = app.service('users');

  service.hooks(hooks);
}
