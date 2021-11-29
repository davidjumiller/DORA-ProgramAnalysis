/*
    Team 24, DORA (Diagrammatic Observed Relationship Analyzer)
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