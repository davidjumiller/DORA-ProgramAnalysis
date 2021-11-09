import testController from './controllers/testController.js';

const routes = [

  {
    method: 'GET',
    url: '/v1/',
    handler: testController.helloWorld
  }
]

export default routes;