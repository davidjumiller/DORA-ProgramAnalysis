import * as acorn from 'acorn';
import * as fs from 'fs';
import Visitor from './Visitor.js';

// Our output to send to visualizer
let objArrayOutput = [];
let fileID = 0;

let tempObj = {
    "id": "temp",
    "calls": []
}

objArrayOutput.push(tempObj);

// Async read js file from input directory
fs.readFile("./src/inputs/test1.js", "utf8", (err, input) => {
    if (err) { console.log(err); } else {

        // Parse javascript into acorn's JSON format (AST) 
        let parsedInput = acorn.parse(input, {ecmaVersion: 2020, sourceType: "module", locations: true});

        // Create a new "file" object for our output
        fileID++;
        let fileObjSkeleton = {
            "id": fileID,
            "filePath": "TODO",
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
        let visitor = new Visitor(objArrayOutput, fileID);
        visitor.visitNode(parsedInput);
    }

    // Async write json output file to outputs directory
    // **Just for testing purposes, delete later
    fs.writeFile("./src/outputs/test1out.json",  JSON.stringify(objArrayOutput, null, 4), (err) => {
        if (err) { console.log(err); } else {
            console.log("done write");
        }
    });
});