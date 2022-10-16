import { Application } from '../declarations';
import users from './users/users.service';
import properties from './properties/properties.service';
export default function (app: Application): void {
  app.configure(users);
  app.configure(properties);
}
