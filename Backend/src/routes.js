import repoController from './controllers/repoController.js';

const routes = [
  {
    method: 'GET',
    url: '/v1/',
    handler: repoController.test
  },

  {
    method: 'POST',
    url: '/v1/parse',
    handler: repoController.fetchRepo
  },

  {
    method: 'POST',
    url: '/v1/parseLocal',
    handler: repoController.parseLocal
  }
]

export default routes;