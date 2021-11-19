export default class Visitor {
    visitNodes(nodes) { for (let node of nodes) this.visitNode(node); }
    visitNode(node) {
        switch (node.type) {
            case 'Program': return this.visitProgram(node);
            // TODO: Rest of the switch cases for node visitor
        }
    }
    visitProgram(node) { return this.visitNodes(node.body); }

    // TODO: Check here for require statements
    visitVariableDeclaration(node){ return this.visitNodes(node.declarations) }
    visitVariableDeclarator(){}

    // TODO: Check here for imports
    visitImportDeclaration(node){}

    visitIdentifier(node){ return node.name; };

    visitLiteral(node){/* Do nothing for now */};
}