let acorn = require("acorn");
let fs = require("fs");
let Visitor = require("./Visitor.js");

// Async read js file from input directory
fs.readFile(__dirname + "/inputs/test1.js", "utf8", (err, input) => {
    let data;
    if (err) { console.log(err); } else {
        let parsedInput = acorn.parse(input, {ecmaVersion: 2020, sourceType: "module"});
        data = JSON.stringify(parsedInput, null, 4);
        let visitor = new Visitor();
        visitor.visitNode(parsedInput);
    }

    // Async write json file to outputs directory
    // **Just for testing purposes, delete later
    fs.writeFile(__dirname + "/outputs/test1out.json",  data, (err) => {
        if (err) { console.log(err); } else {
            console.log("done write");
        }
    });
});