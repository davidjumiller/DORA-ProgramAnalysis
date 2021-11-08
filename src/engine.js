let acorn = require("acorn");

let input = "1 + 1"; // Test input for now

console.log(acorn.parse(input, {ecmaVersion: 2020}));