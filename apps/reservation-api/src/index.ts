import logger from './logger';
import app from './app';
import isPortReachable from 'is-port-reachable';

async function start() {
  const port = app.get('port');
  // await isPortReachable(port,{host:'localhost'}).then((isPortReachable) => console.log(isPortReachable));
  const server = app.listen(port);

  process.on('unhandledRejection', (reason, p) =>
    logger.error('Unhandled Rejection at: Promise ', p, reason)
  );

  server.on('listening', () =>
    logger.info('Feathers application started on http://%s:%d', app.get('host'), port)
  );
}

start();
