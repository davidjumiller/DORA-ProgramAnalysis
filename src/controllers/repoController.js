/*
    Team 24, DORA (Diagrammatic Observed Relationship Analyzer)
*/

import download from 'download-git-repo';

const repoController = {};

repoController.fetch = async(req, res) => {
  let body = req.body;

  // TODO: get the link, then split it into owner and the repo name
  // TODO: use uuid for the folder name

  download('dhruv-tech/rivescript-brain', './src/appData/test', function (err) {
    console.log(err ? 'Error' : 'Success');
  });

  res.send(200);
};

export default repoController;