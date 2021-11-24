import fs from 'fs';
import * as acorn from 'acorn';
import Visitor from './Visitor';

// Async read js file from input directory
fs.readFile(__dirname + "/inputs/test1.js", "utf8", (err, input) => {
    let data;
    if (err) { console.log(err); } else {
        let parsedInput = acorn.parse(input, {ecmaVersion: 2020, sourceType: "module"});
        data = JSON.stringify(parsedInput, null, 4);
        let visitor = new Visitor();
        visitor.visitNode(parsedInput);
    }

    // // Async write json file to outputs directory
    // // **Just for testing purposes, delete later
    fs.writeFile(__dirname + "/outputs/test1out.json",  data, (err) => {
        if (err) { console.log(err); } else {
            console.log("done write");
        }
    });
});

// Async read js file from input directory
// fs.readFile(__dirname + "/inputs/test1.js", "utf8", (err, input) => {
//     let data;
//     if (err) { console.log(err); } else {
//         data = JSON.stringify(acorn.parse(input, {ecmaVersion: 2020, sourceType: "module"}), null, 4);
//     }

//     // Async write json file to outputs directory
//     fs.writeFile(__dirname + "/outputs/test1out.json",  data, (err) => {
//         if (err) { console.log(err); } else {
//             console.log("done write");
//         }
//     });
// });

const readFolders = (pathName) => {
    fs.readdir(pathName, {withFileTypes: true}, (err, files) => {
        if (err) {
            console.log(`error reading dir: ${err}`);
        } else {
            for(let i = 0; i < files.length; i++) {
                const filePath = files[i].name;
                const lcFilePath = filePath.toLowerCase();
                const regex = /\.[\w]+\.js$/g;
                if (lcFilePath !== "node_modules" && files[i].isDirectory() && !lcFilePath.startsWith(".")) {
                    console.log(`File path = ${lcFilePath}`);
                    console.log(`Read file path = ${pathName}/${filePath}}`);
                    readFolders(pathName + `/${filePath}`);
                } else if (files[i].isFile() && lcFilePath.endsWith(".js") && !regex.test(lcFilePath)) { // TODO: add check to only read files that are .js AND not .d.js
                    // TODO: read file
                    console.log(`reading file: ${lcFilePath}`);
                }
            }
        }
    })
}

const getDepsForFile = (repoName) => {
    /* TODO:
        - Given a file name, generate the AST from acorn
        - Extract all dependencies that is from static module or external import
        - Exclude any import of .png, .txt, etc. imports
    */
    // for each folder in appData/${repoName}/src check if there's a .js if there is parse it
    fs.readFile(__dirname + ``, "utf8", (err, input) => {
        let data;
        if (err) {
            console.log(err);
        } else {
            try {
                const acornAST = acorn.parse(input, {ecmaVersion: 2020, sourceType: "module"});
            } catch (error) {
                console.log(error);
            }
        }
    
        // Async write json file to outputs directory
        // fs.writeFile(__dirname + "/outputs/test1out.json",  data, (err) => {
        //     if (err) { console.log(err); } else {
        //         console.log("done write");
        //     }
        // });
    });
    console.log(repoName);
}

export default readFolders;