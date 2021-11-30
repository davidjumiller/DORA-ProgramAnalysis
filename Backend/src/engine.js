import * as acorn from 'acorn';
import fs, { readFile } from 'fs';
import path from 'path';
import Visitor from './Visitor.js';

// Async read js file from input directory
export const readIndividualFile = (objArrayOutput, pathName, fileID, repoID) => {
    const file = fs.readFileSync(pathName, {encoding:"utf8"});

    // Parse javascript into acorn's JSON format (AST) 
    let parsedInput = acorn.parse(file, {ecmaVersion: "latest", sourceType: "module", locations: true});

    let curID = fileID.value;
    fileID.value++;

    const relPath = path.relative(`./src/inputs/${repoID}`, pathName);

    // Create a new "file" object for our output
    let fileObjSkeleton = {
        "id": curID,
        "filePath": relPath,
        "functions": [],
        "imports": [],
        "importedInFiles": []
    }

    // Push object to output array
    objArrayOutput.push(fileObjSkeleton);

    /** Traverse AST, fill in the above skeleton with functions found.
    *   If imports are found, or calls are made, find the corresponding
    *   "file" object and add the values there.
    */
    let visitor = new Visitor(objArrayOutput, curID);
    visitor.visitNode(parsedInput);
}

export const readFoldersSync = (objArrayOutput, pathName, fileID, repoID) => {
    const files = fs.readdirSync(pathName, {withFileTypes: true});
    files.forEach((file) => {
        const filePath = file.name;
        const lcFilePath = filePath.toLowerCase();
        const fullPath = path.resolve(pathName, filePath);
        const regex = /\.[\w]+\.js$/g;
        // Ignore any node_modules or hidden folders
        if (lcFilePath !== "node_modules" && file.isDirectory() && !lcFilePath.startsWith(".")) {
            // console.log(`Read file path = ${fullPath}`);
            readFoldersSync(objArrayOutput, fullPath, fileID, repoID);

            // Ignore everything other than .js fils (exclude .min.js, .d.js, etc as well)
        } else if (file.isFile() && lcFilePath.endsWith(".js") && !regex.test(lcFilePath)) {
            // getDepsForFile(fullPath);
            readIndividualFile(objArrayOutput, fullPath, fileID, repoID);
            console.log(`reading file: ${fullPath}`);
        }
    });
}

export const parseDir = (pathName, repoID) => {

    // Our output to send to visualizer
    let objArrayOutput = [];

    let tempObj = {
        "id": "temp",
        "calls": [],
        "imports": []
    }

    objArrayOutput.push(tempObj);

    let fileID = {
        "value": 1
    }
    readFoldersSync(objArrayOutput, pathName, fileID, repoID);

    /** Go through "temp" objects that couldn't be matched to functions
    *   on the first pass, either because there is no matching function locally,
    *   or we had not read through the file containing the function/method yet.
    *   Check them again here after all files are read through  */
    let tempIndex = objArrayOutput.findIndex(obj => obj.id == "temp");
    // Final matching for imports
    objArrayOutput[tempIndex].imports.forEach(imp => {
        let importeeFileObj = objArrayOutput.find(file => { return file.id == imp.importeeFileID});
        objArrayOutput.forEach(file => {
            if (imp.filePath == file.filePath) {
                importeeFileObj.imports.push(file.id);
                file.importedInFiles.push(imp.importeeFileID);
            }
        });
    });
    // Final matching for calls
    objArrayOutput[tempIndex].calls.forEach(call => {
        objArrayOutput.forEach(file => {
            if (file.id != "temp") {
                file.functions.forEach(func => {
                    // Find the function/method that matches the call
                    if (call.name == func.name 
                        && call.paramCount == func.paramCount 
                        && (call.type == "Functional" || (call.type == "OOP" && call.className == func.className))) {
                            /** Check if this function has been called already and has an existing object in the 
                                *  output, if so, increase countRef, otherwise create a new object to push */
                            let calledAlready = func.calledBy.findIndex(existingCalledBy => {
                                existingCalledBy.id == call.id;
                            });
                            if (calledAlready == -1) {
                                let newCalledBy = {
                                    "id": call.id,
                                    "atLineNum": call.atLineNum,
                                    "countRefs": 1
            
                                }
                                func.calledBy.push(newCalledBy);
                            } else {
                                func.calledBy[calledAlready].countRefs++;
                            }
                    }
                });
            }
        });
    });

    // Remove "temp" obj from the array
    objArrayOutput.splice(tempIndex, 1);

    // Async write json output file to outputs directory
    // **Just for testing purposes, delete later
    fs.writeFile("./src/outputs/test1out.json",  JSON.stringify(objArrayOutput, null, 4), (err) => {
        if (err) { console.log(err); } else {
            console.log("done write");
        }
    });

    return objArrayOutput;
}

const getDepsForFile = (repoPath) => {
    console.log(`Read file: ${repoPath}`);
    /* TODO:
        - Given a file name, generate the AST from acorn
        - Traverse the AST to generate an object storing info needed to generate graphs in the frontend
    */
}

// parseDir("./src/inputs");
