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

repoController.fetchRepo = async(req, res) => {

  const folderName = uuidv4();
  const dest = `./src/inputs/${ folderName }`;

  const url = new URL(req.body.url);
  const repo = url.pathname.substring(1);

  download(repo, dest, function (err) {
    if (err) {
      console.log(`Error: ${ err.message }`);
      res.code(400);
      res.send({
        'error': `Failed to download repo from the provided url ${url}. Make sure your repo is public and the link is correct.`,
      })
    }
    else {
      console.log(`Success, the repo is saved at ${ dest }`);
      parseDir(dest);
      res.code(200);
      res.send({
        'msg': `Success, the repo is successfully parsed`,
        'dest': dest
      })
    }
  });
}

repoController.testRead = async(req, res) => {
  parseDir('./src/inputs/testRepo');
  res.code(200);
  res.send({
    'message': 'Success, the folders are read'
  });
}

export default repoController;