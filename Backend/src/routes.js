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
  },

  // TODO: This endpoint is here to test read folders separately from other functionalities
  //       We might not need this v1/read in the final product, since we can immediately
  //       read the repo after download
  {
    method:'POST',
    url: '/v1/read',
    handler: repoController.testRead
  }

]

export default routes;