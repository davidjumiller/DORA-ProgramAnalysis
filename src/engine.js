let acorn = require("acorn");
let fs = require("fs");

// Async read js file from input directory
fs.readFile(__dirname + "/inputs/test1.js", "utf8", (err, input) => {
    let data;
    if (err) { console.log(err); } else {
        data = JSON.stringify(acorn.parse(input, {ecmaVersion: 2020, sourceType: "module"}), null, 4);
    }

    // Async write json file to outputs directory
    fs.writeFile(__dirname + "/outputs/test1out.json",  data, (err) => {
        if (err) { console.log(err); } else {
            console.log("done write");
        }
    });
});