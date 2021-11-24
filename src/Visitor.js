export default class Visitor {
    constructor(output, curFileID) {
        this.curFileID = curFileID;
        this.output = output;
    }
    visitNodes(nodes) { for (let node of nodes) this.visitNode(node); }
    visitNode(node) {
        switch (node.type) {
            case 'Program': return this.visitProgram(node);
            case 'ImportDeclaration': return this.visitImportDeclaration(node);
            case 'VariableDeclaration': return this.visitVariableDeclaration(node);
            case 'VariableDeclarator': return this.visitVariableDeclarator(node);
            case 'ExportNamedDeclaration': return this.visitExportNamedDeclaration(node);
            case 'FunctionDeclaration': return this.visitFunctionDeclaration(node);
            case 'Identifier': return this.visitIdentifier(node);
            case 'Literal': return this.visitLiteral(node);
            case 'ExpressionStatement': return this.visitExpressionStatement(node);
            case 'CallExpression': return this.visitCallExpression(node);
            // TODO: Rest of the switch cases for node visitor
        }
    }
    visitProgram(node) { 
        this.visitNodes(node.body); 
        return;
    }

    // TODO: Check here for require statements
    visitVariableDeclaration(node){ return this.visitNodes(node.declarations) }
    visitVariableDeclarator(node){}

    // TODO: Check here for imports
    visitImportDeclaration(node){}

    // TODO: Check here for functions
    visitFunctionDeclaration(node){
        let name = node.id.name;
        let paramCount = node.params.length;
        let signature = name + "(" + paramCount + ")";

        let newFunction = {
            "signature": signature,
            "calledBy": []
        }

        this.output.forEach(file => {
            if (file.id == this.curFileID){
                file.functions.push(newFunction);
            }
        });

        return this.visitNodes(node.body.body);
    }

    visitExpressionStatement(node){ return this.visitNode(node.expression) }
    visitCallExpression(node){
        let calleeSignature, paramCount, name;
        if (node.callee.type == "Identifier") {
            paramCount = node.arguments.length;
            name = node.callee.name;
            calleeSignature = name + "(" + paramCount + ")";
        } else if (node.callee.type == "MemberExpression") {
            // TODO
            return;
        } else {
            console.log("Unrecognized type in CallExpression");
            return;
        }

        let validFunctionFound = false;
        // Search each "file" object for the appropriate function that is being called
        this.output.forEach(file => {
            // Don't check our temp object
            if (file.id != "temp"){
                file.functions.forEach(func => {
                    if (func.signature == calleeSignature) {
                        validFunctionFound = true;
                        // Check if this function has been called in this file already, if so, increment countRef,
                        // and add the line number
                        let calledBefore = false;
                        func.calledBy.forEach(call => {
                            if (call.id == this.curFileID){
                                call.countRefs++;
                                call.atLineNum.push(node.loc.start.line);
                                calledBefore = true;
                            }
                        });
                        // If no calls to the function from our current file are found, create a new object and push
                        if (calledBefore == false){

                            let calledByObj = {
                                "id": this.curFileID,
                                "atLineNum": [node.loc.start.line],
                                "countRefs": 1
                            };
                            func.calledBy.push(calledByObj);
                        } else {
                        }
                    }
                })
            }
        });
    }

    visitExportNamedDeclaration(node){}
    visitIdentifier(node){ return node.name; }

    visitLiteral(node){/* Do nothing for now */};
}