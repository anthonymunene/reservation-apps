import { PrismaService ,PrismaServiceOptions } from 'feathers-prisma';
import { Application } from '../../declarations';

interface Options extends PrismaServiceOptions { }

export class Properties extends PrismaService {
  constructor(options: Options, app: Application) {
    super(
      options,
      app.get('prisma')
    );
  }
}
