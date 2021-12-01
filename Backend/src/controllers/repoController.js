/*
    Team 24, DORA (Diagrammatic Observed Relationship Analyzer)
*/

import download from 'download-git-repo';
import { v4 as uuidv4 } from 'uuid';
import { parseDir } from '../engine.js';
import { rmSync } from 'fs';

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
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST");
      res.code(400);
      res.send({
        'error': `Failed to download repo from the provided url ${url}. Make sure your repo is public and the link is correct.`,
      });
    }
    else {
      console.log(`Success, the repo is saved at ${ dest }`);
      const data = parseDir(dest, folderName);
      rmSync(dest, {recursive: true});
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST");
      res.code(200);
      res.send({
        'msg': `Success, the repo is successfully parsed`,
        data
      });
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

repoController.parseLocal = async(req, res) => {
  try {
    const data = parseDir(req.body.path, req.body.folderName);
    res.code(200);
    res.send({
      'msg': 'Success, the local repo is successfully parsed',
      data
    });
  } catch (error) {
    res.code(500);
    res.send({
      'err': `Error: failed to parse the local repo ${error?.message || error}`
    });
  }
}

export default repoController;