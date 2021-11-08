/*
    Team 24, Music Maker DSL API
*/

import fastify from 'fastify';
import routes from './routes.js';

const build = (opts={}) => {

  const app = fastify(opts);

  // Routes

  routes.forEach((route) => {
    app.route(route);
  });

  return app;
}

export default build;