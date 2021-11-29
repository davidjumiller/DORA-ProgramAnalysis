/*
    Team 24, DORA (Diagrammatic Observed Relationship Analyzer)
*/

import download from 'download-git-repo';
import { v4 as uuidv4 } from 'uuid';
import { parseDir } from '../engine.js';

const repoController = {};

repoController.test = async(req, res) => {
  res.code(200);
  res.send({msg: 'Up and running!'});
}

repoController.fetch = async(req, res) => {

  const folderName = uuidv4();
  const dest = `./src/appData/${ folderName }`;

  const url = new URL(req.body.url);
  const repo = url.pathname.substring(1);

  download(repo, dest, function (err) {
    if (err) {
      console.log(`Error: ${ err.message }`);
    }
    else {
      console.log(`Success, the repo is saved at ${ dest }`);
    }
  });

  res.code(200);
  res.send({
    'msg': `Success, the repo is saved at ${ dest }`,
    'dest': dest
  })
}

repoController.testRead = async(req, res) => {
  parseDir('./src/inputs/testRepo');
  res.code(200);
  res.send({
    'message': 'Success, the folders are read'
  });
}

export default repoController;