const getFilesThatCallKeyFile = (json) => {

  let filesThatCallsKeyFile = new Map();

  for (const jsonElement of json) {

    const currentFileId = jsonElement.id;
    filesThatCallsKeyFile.set(currentFileId, []);

    const funcArr = jsonElement.functions;

    for (const func of funcArr) {

      const calledByArr = func.calledBy;

      for (const element of calledByArr) {

        let valueArr = filesThatCallsKeyFile.get(currentFileId);
        if (!valueArr.includes(element.id)) {
          valueArr.push(element.id);
        }
      }
    }
  }

  console.log(filesThatCallsKeyFile);
  return filesThatCallsKeyFile;
}


const getWhatKeyFileCalls = (json) => {
  let whatKeyFileCalls = new Map();

  for (const jsonElement of json) {
    const currFileId = jsonElement.id;
    whatKeyFileCalls.set(currFileId, []);

    for (const otherFile of json) {

      const otherId = otherFile.id;

      if (otherId !== currFileId) {

        const funcArr = otherFile.functions;

        for (const func of funcArr) {

          const calledByArr = func.calledBy;

          for (const element of calledByArr) {

            let valueArr = whatKeyFileCalls.get(currFileId);

            if (!valueArr.includes(otherId) && element.id === currFileId) {

              valueArr.push(otherId);
            }
          }
        }
      }
    }
  }

  console.log(whatKeyFileCalls);
  return whatKeyFileCalls;
}

const getCallHierarchy = (fileId, signature, json) => {
  let file;
  for (const jsonElement of json) {
    if (jsonElement.id === fileId) {
      file = jsonElement;
      break;
    }
  }

  if (file === undefined) {
    throw new Error("Cannot find file Id");
  }

  let theFunc;
  const funcArr = file.functions;

  for (const func of funcArr) {
    if (func.signature === signature) {
      theFunc = func;
      break;
    }
  }

  if (theFunc === undefined) {
    throw new Error("Cannot find the function");
  }

  let output = {};
  output.displayName = signature;
  output.type = theFunc.type;
  output.fileId = fileId;
  output.calledBy = [];

  for (const calledByElement of theFunc.calledBy) {
    let calledByFunc = findCallingFunc(calledByElement.id, calledByElement.atLineNum, json, [signature]);
    if (typeof(calledByFunc) !== "string") {
      if (output.calledBy.length === 0) {
        output.calledBy = calledByFunc;
      } else {
        output.calledBy = output.calledBy.concat(calledByFunc);
      }
    } else {
      let loopBack = {};
      loopBack.displayName = calledByFunc + "[loop back]";
      loopBack.type = null;
      loopBack.fileId = null;
      loopBack.calledBy = null;
      output.calledBy.push(loopBack);
    }
  }

  return output;
}

const findCallingFunc = (fileId, lineNumArr, json, visited) => {
  let file;
  for (const jsonElement of json) {
    if (jsonElement.id === fileId) {
      file = jsonElement;
      break;
    }
  }

  if (file === undefined) {
    throw new Error("Cannot find file Id");
  }

  let functionsCalling = [];

  let linesWithFunction = [];

  const funcArr = file.functions;
  for (const func of funcArr) {
    const start = func.startLine;
    const end = func.endLine;

    for (const lineNumArrElement of lineNumArr) {
      if (start <= lineNumArrElement && lineNumArrElement <= end) {

        linesWithFunction.push(lineNumArrElement)

        if (visited.includes(func.signature)) {
          return func.signature;
        }

        let theFunc = {};
        theFunc.displayName = func.signature;
        theFunc.type = func.type;
        theFunc.fileId = fileId;
        theFunc.calledBy = [];
        for (const calledByElement of func.calledBy) {
          visited.push(func.signature);
          let calledByFunc = findCallingFunc(calledByElement.id, calledByElement.atLineNum, json, visited);
          if (typeof(calledByFunc) !== "string") {
            if (theFunc.calledBy.length === 0) {
              theFunc.calledBy = calledByFunc;
            } else {
              theFunc.calledBy = theFunc.calledBy.concat(calledByFunc);
            }
          } else {
            let loopBack = {};
            loopBack.displayName = calledByFunc + "[loop back]";
            loopBack.type = null;
            loopBack.fileId = null;
            loopBack.calledBy = null;
            theFunc.calledBy.push(loopBack);
          }
        }
        functionsCalling.push(theFunc);

      }
    }
  }

  for (const lineNum of lineNumArr) {
    if (!linesWithFunction.includes(lineNum)) {
      let theLine = {};
      theLine.displayName = "Line " + lineNum;
      theLine.type = null;
      theLine.fileId = fileId;
      theLine.calledBy = [];
      functionsCalling.push(theLine);
    }
  }
  return functionsCalling;
}


const json = [
  {
    "id": 1,
    "filePath": "/src/app.js",
    "functions": [
      {
        "signature": "foo(x)",
        "type": "O",
        "startLine": 135,
        "endLine": 150,
        "calledBy": [
          {
            "id": 2,
            "atLineNum": [
              100,
              152
            ],
            "countRefs": "3"
          },
          {
            "id": 3,
            "atLineNum": [
              10
            ],
            "countRefs": "1"
          }
        ]
      },
      {
        "signature": "foo(x, y)",
        "type": "P",
        "startLine": 99,
        "endLine": 111,
        "calledBy": [
          {
            "id": 2,
            "atLineNum": [
              102
            ],
            "countRefs": "1"
          }
        ]
      }
    ],
    "importedInFiles": [
      2,
      3
    ]
  },
  {
    "id": 2,
    "filePath": "/lib/haha.js",
    "functions": [
      {
        "signature": "blah(x)",
        "type": "O",
        "startLine": 95,
        "endLine": 110,
        "calledBy": [
          {
            "id": 1,
            "atLineNum": [
              110,
              125
            ],
            "countRefs": "2"
          },
          {
            "id": 2,
            "atLineNum": [
              1
            ],
            "countRefs": "1"
          }
        ]
      },
      {
        "signature": "bobTheBuilder(x, y)",
        "type": "Bam",
        "startLine": 135,
        "endLine": 155,
        "calledBy": [
          {
            "id": 3,
            "atLineNum": [
              100
            ],
            "countRefs": "1"
          },
          {
            "id": 1,
            "atLineNum": [
              69
            ],
            "countRefs": "1"
          }
        ]
      }
    ],
    "importedInFiles": [
      1,
      3
    ]
  },
  {
    "id": 3,
    "filePath": "/lib/bam.js",
    "functions": [
      {
        "signature": "hornet(x)",
        "type": "P",
        "startLine": 135,
        "endLine": 150,
        "calledBy": [
          {
            "id": 1,
            "atLineNum": [
              110,
              125
            ],
            "countRefs": "2"
          },
          {
            "id": 2,
            "atLineNum": [
              1
            ],
            "countRefs": "1"
          }
        ]
      },
      {
        "signature": "cornTheCorner(x, y)",
        "type": "AB",
        "startLine": 135,
        "endLine": 150,
        "calledBy": [
          {
            "id": 2,
            "atLineNum": [
              100
            ],
            "countRefs": "1"
          },
          {
            "id": 3,
            "atLineNum": [
              69
            ],
            "countRefs": "1"
          }
        ]
      }
    ],
    "importedInFiles": [
      1,
      2
    ]
  }
]

//getFilesThatCallKeyFile(json);
//getWhatKeyFileCalls(json);

let result = getCallHierarchy(1, "foo(x)", json);
console.log(JSON.stringify(result, null, 4));

