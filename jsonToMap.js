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


const json = [
  {
    "id": 1,
    "filePath": "/src/app.js",
    "functions": [
      {
        "signature": "foo(x)",
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
            "id": 5,
            "atLineNum": [
              10
            ],
            "countRefs": "1"
          }
        ]
      },
      {
        "signature": "foo(x, y)",
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
      3,
      5,
      10
    ]
  },
  {
    "id": 2,
    "filePath": "/lib/haha.js",
    "functions": [
      {
        "signature": "blah(x)",
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
            "id": 10,
            "atLineNum": [
              1
            ],
            "countRefs": "1"
          }
        ]
      },
      {
        "signature": "bobTheBuilder(x, y)",
        "calledBy": [
          {
            "id": 5,
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
      3,
      5,
      10
    ]
  },
  {
    "id": 3,
    "filePath": "/lib/bam.js",
    "functions": [
      {
        "signature": "hornet(x)",
        "calledBy": [
          {
            "id": 5,
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
        "signature": "CornTheCorner(x, y)",
        "calledBy": [
          {
            "id": 2,
            "atLineNum": [
              100
            ],
            "countRefs": "1"
          },
          {
            "id": 10,
            "atLineNum": [
              69
            ],
            "countRefs": "1"
          }
        ]
      }
    ],
    "importedInFiles": [
      3,
      5,
      10
    ]
  }
]

getFilesThatCallKeyFile(json);
getWhatKeyFileCalls(json);