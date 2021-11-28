import * as acorn from 'acorn';
import fs from 'fs';
import path from 'path';
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

export const readFolders = (pathName) => {
    fs.readdir(pathName, {withFileTypes: true}, (err, files) => {
        if (err) {
            console.log(`error reading dir: ${err}`);
        } else {
            console.log(`reading folder path ${pathName}`);
            for(let i = 0; i < files.length; i++) {
                const filePath = files[i].name;
                const fullPath = path.resolve(pathName, filePath);
                const lcFilePath = filePath.toLowerCase();
                const regex = /\.[\w]+\.js$/g;
                // Ignore any node_modules or hidden folders
                if (lcFilePath !== "node_modules" && files[i].isDirectory() && !lcFilePath.startsWith(".")) {
                    // console.log(`Read file path = ${pathName}/${filePath}}`);
                    readFolders(fullPath);

                    // Ignore everything other than .js fils (exclude .min.js, .d.js, etc as well)
                } else if (files[i].isFile() && lcFilePath.endsWith(".js") && !regex.test(lcFilePath)) {
                    getDepsForFile(fullPath);
                    // TODO: read file
                    // console.log(`reading file: ${lcFilePath}`);
                }
            }
        }
    })
}

export const readFoldersSync = (pathName) => {
    const files = fs.readdirSync(pathName, {withFileTypes: true});
    files.forEach((file) => {
        const filePath = file.name;
        const fullPath = path.resolve(pathName, filePath);
        const lcFilePath = filePath.toLowerCase();
        const regex = /\.[\w]+\.js$/g;
        if (lcFilePath !== "node_modules" && file.isDirectory() && !lcFilePath.startsWith(".")) {
            readFolders(fullPath);

            // Ignore everything other than .js fils (exclude .min.js, .d.js, etc as well)
        } else if (files.isFile() && lcFilePath.endsWith(".js") && !regex.test(lcFilePath)) {
            // TODO: read file
            getDepsForFile(fullPath);
        }
    });
}

const getDepsForFile = (repoPath) => {
    console.log(`Read file: ${repoPath}`);
    /* TODO:
        - Given a file name, generate the AST from acorn
        - Traverse the AST to generate an object storing info needed to generate graphs in the frontend
    */
}

// export default readFolders;