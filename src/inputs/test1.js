import test1 from "test1";
import * as test3 from "test3";
let test4 = require("test4");

let tips = [
  "Click on any AST node with a '+' to expand it",

  "Hovering over a node highlights the \
   corresponding location in the source code",

  "Shift click on an AST node to expand the whole subtree"
];

function tips1(x, y) {

}

class class1 {
  tips2(x, y) {
  }
}

let classNew;
classNew = new class1();
classNew.tips2(1, 2);

function printTips(x, y) {
  tips.forEach((tip, i) => console.log(`Tip ${i}:` + tip));
  tips.test();
  tips1(x, y);
}

printTips(1, 2);