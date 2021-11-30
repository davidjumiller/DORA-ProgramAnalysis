<script>
    import { onMount } from 'svelte';
	import panzoom from "panzoom";

    import * as jsPlumbBrowserUI from "@jsplumb/browser-ui";
    import { FlowchartConnector } from "@jsplumb/connector-flowchart";

    // Mockup data

    let mockup = [
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

    const sortDataByDirectory = (files) => {

        let sortedData = new Map();

        for (let file of files) {
            
            let filePath = file.filePath;
            let dir = filePath.substring(0, filePath.lastIndexOf("/"));

            if (sortedData.has(dir)) {

                let existingFiles = sortedData.get(dir);

                existingFiles.push(file);

                sortedData.set(dir, existingFiles);

            } else {

                let newEntry = [];
                newEntry.push(file);

                sortedData.set(dir, newEntry);

            }


        }

        return sortedData;
    }

    let filesMap = sortDataByDirectory(mockup);

    let filesArray = Array.from(filesMap);
    console.log(filesArray);

    onMount(() => {

		let zoomableElement = document.querySelector('.zoomable');
        panzoom(zoomableElement);

        const instance = jsPlumbBrowserUI.newInstance({
            container: document.querySelector('#diagram')
        })


        // get 2 maps : called by and calls to

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

            return whatKeyFileCalls;

        }

        // Make super map - sorted by type of relationship i.e. called from, calls to, and bi-directional.

        let calledby = getFilesThatCallKeyFile(mockup);
        alert('hi');

        // for (const [key, values] of calledby.entries()) {

        //     for (let value of values) {

        //         if (value != key) {
        //             console.log(`${value} - ${key}`)
        //             instance.connect({
        //                 source: document.querySelector(`#file_${value}`),
        //                 target: document.querySelector(`#file_${key}`),
        //                 anchor:"Continuous",
        //                 connector: {
        //                     type: FlowchartConnector.type,
        //                     options: {
        //                         alwaysRespectStubs: false,
        //                         cornerRadius: 5
        //                     }
        //                 },
        //                 overlays:[ 
        //                     { type:"Arrow", options:{location:1}}
        //                 ]
        //             })
        //         }
                
        //     }
            
        // }

        // Generate nodes/divs

        // Attach endpoints
        

	});

</script>

<div class="zoomable-wrapper">
    
    <div class="zoomable" id="diagram">      

        {#each filesArray as dir, y}
            {#each dir[1] as file, x}
                <div id="file_{file.id}" class="node" style="margin-top: {(x * 100)}px; margin-left: {(y * 250)}px;"> {file.filePath} </div>
            {/each}
	    {/each}

    </div>

</div>

<style>

	.zoomable-wrapper {
        height: 100vh;
        width: 100vw;
        background: url(tile.png);
        background-blend-mode: darken;
    }

    .zoomable {
        min-height: 100vh;
        min-width: 100vw;
    }

    .node{
        position: absolute;
        width: 190px;
        height: 82px;
        left: 142px;
        top: 98px;

        background: rgba(244, 244, 244, 0.76);
        border: 1px solid #B0B0B0;
        box-sizing: border-box;
        box-shadow: 0px 0px 6px 5px rgba(191, 191, 191, 0.14);
        border-radius: 10px;
        z-index: 1;
    }

    svg {
        z-index: 0;
    }

</style>