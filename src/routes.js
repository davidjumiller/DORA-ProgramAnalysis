import repoController from './controllers/repoController.js';

const routes = [

  {
    method: 'GET',
    url: '/v1/',
    handler: repoController.test
  },

  {
    method: 'POST',
    url: '/v1/fetch',
    handler: repoController.fetch
  }

]

export default routes;