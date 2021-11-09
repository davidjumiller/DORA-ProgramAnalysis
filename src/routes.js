import repoController from './controllers/repoController.js';

const routes = [

  {
    method: 'GET',
    url: '/v1/',
    handler: repoController.fetch
  }
]

export default routes;