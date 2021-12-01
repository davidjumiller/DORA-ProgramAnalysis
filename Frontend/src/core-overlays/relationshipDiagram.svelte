<script>

    import { afterUpdate, onMount } from 'svelte';
	import panzoom from "panzoom";

    import * as jsPlumbBrowserUI from "@jsplumb/browser-ui";
    import { FlowchartConnector } from "@jsplumb/connector-flowchart";

    let repoURL = "";
    
    let toggleInput = true;
    let mockup = [];

    const fetchRepo = async() => {

        if (repoURL == "") {
            alert("Invalid URL");
        } else {
            fetch("https://dora-api-5pn92.ondigitalocean.app/v1/parse", {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
            },
                "body": `{"url":"${repoURL}"}`
            })
            .then(async(response) => {
                if (!response.ok) {
                    let body = await response.json();
                    alert(body.error);
                } else {
                    let body = await response.json();
                    mockup = body.data;
                    console.log(mockup)
                    calledby = getFileMetadata(mockup);
                    filesMap = sortDataByDirectory(mockup);
                    filesArray = Array.from(filesMap);
                    toggleInput = false;
                }
            })
            .catch(err => {
                alert(repoURL);
                alert(err);
                console.log(err);
            });
        }

    }
    let callModalData = "";
    const buildCallGraph = (ofFile, signature) => {

        callModalData = "";
        callModal = true;
        let struc = getCallHierarchy(ofFile, signature, mockup);
        usageModal.isVisible = false;

        let toInject = ``;
        let items = ``;
        for (let e of struc.calledBy) {

            let meta = calledby.get(e.fileId);
            let filePath = "Unknown File";
            let type = "Unknown type";
            if (meta) {
                filePath = meta.filePath;
            }
            if (e.type) {
                type = e.type;
            }

            items += `<li> [${type}] ${e.displayName} <i>in ${calledby.get(e.fileId).filePath}</i> ${getAdditionalCallGraph(e)}</li>`;
        }

        if (items != ``) {
            toInject = `<ul>${items}</ul>`;
        }

        let meta = calledby.get(struc.fileId);
        let filePath = "Unknown File";
        let type = "Unknown type";
        if (meta) {
            filePath = meta.filePath;
        }
        if (struc.type) {
            type = struc.type;
        }
        callModalData = `<ul><li> [${type}] ${struc.displayName} <i>in ${filePath}</i> ${toInject}</li></ul>`;
    }

    const getAdditionalCallGraph = (struc) => {

        let toInject = ``;
        let items = ``;
        for (let e of struc.calledBy) {

            let meta = calledby.get(e.fileId);
            let filePath = "Unknown File";
            let type = "Unknown type";
            if (meta) {
                filePath = meta.filePath;
            }
            if (e.type) {
                type = e.type;
            }

            items += `<li> [${type}] ${e.displayName} <i>in ${filePath}</i> ${getAdditionalCallGraph(e)}</li>`;
        }

        if (items != ``) {
            toInject = `<ul>${items}</ul>`;
        }



        return toInject;

    }

    const sortDataByDirectory = (files) => {

        let sortedData = new Map();

        for (let file of files) {
            
            let filePath = file.filePath;
            console.log(filePath);
            let dir = filePath.substring(0, filePath.lastIndexOf("/"));
            console.log(dir);
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

    const getCallHierarchy = (fileId, signature, json) => {
        console.log(fileId);
        console.log(signature);
        console.log(json);
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

        console.log(output);
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

    const getFileMetadata = (files) => {

        let fileRelations = new Map();

        for (let file of files) {

            let key = file.id;

            let value = {
                imports: file.imports,
                importedIn: file.importedInFiles,
                filePath: file.filePath,
                name: file.filePath.substring(file.filePath.lastIndexOf('\\')+1, file.filePath.length),
                functions: file.functions,
                id: file.id
            }

            fileRelations.set(key, value);
        }

        return fileRelations;
    }

    let calledby = null;

    const getFileUsage = (ofFile, inFile) => {

        let ofFileData = calledby.get(ofFile);

        let callers = [];

        for (let func of ofFileData.functions) {

            let signature = func.signature;

            console.log(func.signature);

            for (let caller of func.calledBy) {
                console.log(caller.id);
                if (caller.id == inFile) {

                    caller.signature = signature;
                    callers.push(caller);

                }
            }

        }

        return callers;
    }

    let filesMap = [];
    let filesArray = [];

    let callModal = false;

    let listingModal = {};
    listingModal.data = {};
    listingModal.data.importedIn = [];
    listingModal.data.imports = [];
    listingModal.data.name = null;
    listingModal.isVisible = false;
    listingModal.toggle = (e = null) => {
        listingModal.isVisible = !listingModal.isVisible;
        let data = calledby.get(e);
        console.log(data);
        listingModal.data =  data;
    }
    listingModal.show = () => {
        listingModal.isVisible = true;
    }
    listingModal.hide = () => {
        listingModal.isVisible = false;
    }

    let usageModal = {};
    usageModal.data = {};
    usageModal.inFileName = null;
    usageModal.ofFileName = null;
    usageModal.inFile = null;
    usageModal.ofFile = null;
    usageModal.isVisible = false;
    usageModal.show = (ofFile, inFile) => {
        usageModal.data = getFileUsage(ofFile, inFile);
        let ofFileData = calledby.get(ofFile);
        let inFileData = calledby.get(inFile);
        usageModal.inFileName = inFileData.name;
        usageModal.ofFileName = ofFileData.name;
        usageModal.inFile = inFile;
        usageModal.ofFile = ofFile;
        listingModal.isVisible = false;
        usageModal.isVisible = true;
        console.log(usageModal.data);
    }
    usageModal.hide = () => {
        usageModal.isVisible = false;
        listingModal.isVisible = true;
    }
    usageModal.see = () => {
        usageModal.isVisible = true;
    }

    const showInputBox = () => {
        toggleInput = true;
    }

    const build = () => {

        const instance = jsPlumbBrowserUI.newInstance({
            container: document.querySelector('#diagram'),
            elementsDraggable: false
        })

        if (calledby != null) {
            for (const [key, values] of calledby.entries()) {

                for (let value of values.imports) {

                    if (value != key) {
                        console.log(`${value} - ${key}`)
                        instance.connect({
                            source: document.querySelector(`#file_${value}`),
                            target: document.querySelector(`#file_${key}`),
                            detachable: false,
                            anchor:"Continuous",
                            connector: {
                                type: FlowchartConnector.type,
                                options: {
                                    alwaysRespectStubs: false,
                                    cornerRadius: 5
                                }
                            },
                            overlays:[ 
                                { type:"Arrow", options:{location:1}}
                            ],
                            endpoints: ["Dot", "Blank"]
                        })
                    }
                    
                }

            }
        }
    }

    afterUpdate(() => {
        build();
    })
    onMount(() => {

		let zoomableElement = document.querySelector('.zoomable');
        panzoom(zoomableElement);

	});

</script>

<header>
    <div id="logo-wrapper">
        <img src="logo.png" alt="DORA Logo" id="logo"/>
        <div id="right-header">
            <button class="button" on:click="{() => {window.location.reload(true)}}">Change Repo</button>
            <button class="button" on:click="{() => {window.location = `https://github.students.cs.ubc.ca/cpsc410-2021w-t1/Project2Group24/blob/master/README.md`}}">Learn More</button>
        </div>
    </div>
</header>

{#if toggleInput}
<div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-content">
        <div id="input-area">   
            <div class="control">
                <h3 class="title is-6">Welcome! Enter public repo URL</h3>
                <input class="input is-focused" type="text" placeholder="Github URL" bind:value={repoURL}>
                <button class="button is-primary" on:click="{() => { fetchRepo() }}"> Analyse This </button>
            </div>
        </div>
    </div>
  </div>
{/if}
{#if usageModal.isVisible}
    <div class="modal is-active">
        <div class="modal-background"></div>
        <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Usage of Functions</p>
            <button class="delete" aria-label="Back" on:click="{usageModal.hide()}"></button>
        </header>
        <section class="modal-card-body">
            <h3 class="title is-6">Usage of {usageModal.ofFileName} in {usageModal.inFileName}</h3>
            {#if usageModal.data.length == 0}
                <p>No functions of {usageModal.ofFileName} are used in {usageModal.inFileName}, only properties are used.</p>
            {:else}
                <p>The following functions were detected:</p>
                <div class="list is-hoverable">
                {#each usageModal.data as caller}
                    <span class="list-item"> → {caller.signature}: {caller.countRefs} Refs <a href="#" on:click="{ () => {buildCallGraph(usageModal.ofFile, caller.signature)}}"> [Callgraph] </a></span><br/>
                    <span class="list-item"> &emsp; → At lines: {caller.atLineNum.toString().replaceAll(',',', ')} </span><br/>
                {/each}
                </div>
            {/if}
        </section>
        </div>
    </div>
{/if}


{#if listingModal.isVisible}
    <div class="modal is-active">
        <div class="modal-background"></div>
        <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">{listingModal.data.name}</p>
            <button class="delete" aria-label="close" on:click="{listingModal.toggle()}"></button>
        </header>
        <section class="modal-card-body">
            <h3 class="title is-5">Imports</h3>
            {#if listingModal.data.imports.length == 0}
                <p>{listingModal.data.name} does not import any '.js' file.</p>
            {:else}
                <p>{listingModal.data.name} imports the following files:</p>
                <div class="list is-hoverable">
                {#each listingModal.data.imports as imports}
                    <span class="list-item"> → {calledby.get(imports).filePath} <a href="#" on:click="{() => { usageModal.show(calledby.get(imports).id, listingModal.data.id) } }">(Function Usage)</a></span><br/>
                {/each}
                </div>
            {/if}
            <br/>

            <h3 class="title is-5">Exports</h3>
            {#if listingModal.data.importedIn.length == 0}
                <p>{listingModal.data.name} is not exported to any '.js' file.</p>
            {:else}
                <p>{listingModal.data.name} is exported to (imported by) the following files:</p>
                <div class="list is-hoverable">
                {#each listingModal.data.importedIn as imported}
                    <span class="list-item"> → {calledby.get(imported).filePath} <a href="#" on:click="{() => { usageModal.show(listingModal.data.id, calledby.get(imported).id) }}">(Function Usage)</a></span><br/>
                {/each}
                </div>
            {/if}
        </section>
        </div>
    </div>
{/if}

{#if callModal}
    <div class="modal is-active">
        <div class="modal-background"></div>
        <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Call Graph</p>
            <button class="delete" aria-label="Back" on:click="{() => {
                callModal = false;
                usageModal.isVisible = true;
            }}"></button>
        </header>
        <section class="modal-card-body" id="callModal_view">
            <p>Call graph rendered as nested lists:</p>
            {@html callModalData}
        </section>
        </div>
    </div>
{/if}


<div class="zoomable-wrapper">
    
    <div class="zoomable" id="diagram">      

        {#each filesArray as dir, y}
            {#each dir[1] as file, x}
                <div id="file_{file.id}" class="node" style="top: {175 + (x * 150)}px; left: {142 + (y * 300)}px;" on:click={() => {listingModal.toggle(file.id)}}> <p> {file.filePath} </p> </div>
            {/each}
	    {/each}

    </div>

    <div class="zoomable" id="tree-diagram">      

        

    </div>

</div>

<style>

	.zoomable-wrapper {
        height: 100vh;
        width: 100vw;
        background: url('/tile.png');
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

        background: rgba(244, 244, 244, 0.76);
        border: 1px solid #B0B0B0;
        box-sizing: border-box;
        box-shadow: 0px 0px 6px 5px rgba(191, 191, 191, 0.14);
        border-radius: 10px;
        z-index: 1;
    }

    .node:hover{
        background: rgba(255, 255, 255, 1);
        cursor: pointer;
    }

    .node p {
        position: relative;
        top: 15px;
        left: 10px; 
    }

    #logo-wrapper {
        position: absolute;
        width: 326px;
        height: 60px;
        left: 50px;
        top: 27.5px;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.81) 0%, rgba(255, 255, 255, 0.6237) 100%);
        box-shadow: 0px 0px 25px rgba(181, 181, 181, 0.25);
        border-radius: 75px;
        z-index: 5 !important;
    }

    #logo {

        height: 60px;
        width: auto;
        padding: 10px;
        margin-left: 15px;
    }

    #right-header button {
        width: 131px;
        height: 41px;

        background: linear-gradient(90deg, rgba(255, 255, 255, 0.81) 0%, rgba(255, 255, 255, 0.6237) 100%);
        box-shadow: 0px 0px 25px rgba(181, 181, 181, 0.25);
        border-radius: 75px;
        border-style: none;
        margin-left: 5px;
        color: #767676;
        font-size: 12pt;
    }
    #right-header {
        position: absolute;
        width: 352px;
        right: -75vw;
        top: 10px;
        z-index: 5 !important;
    }

    #input-area {
        padding: 75px;
        background: rgba(255, 255, 255);
        border-radius: 25px;
    }

    #input-area button {
        float: right;
        margin-top: 10px;;
    }

</style>