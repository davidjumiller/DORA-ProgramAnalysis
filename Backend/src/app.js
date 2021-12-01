/*
    Team 24, DORA (Diagrammatic Observed Relationship Analyzer)
*/

import fastify from 'fastify';
import routes from './routes.js';
import * as cors from 'fastify-cors';

const build = (opts={}) => {

  const app = fastify(opts);

  app.register(cors, { 
 
  })

  // Routes

  routes.forEach((route) => {
    app.route(route);
  });

  return app;
}

export default build;