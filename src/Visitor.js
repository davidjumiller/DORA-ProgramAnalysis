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
            case 'ClassDeclaration': return this.visitClassDeclaration(node);
            case 'MethodDefinition': return this.visitMethodDefinition(node);
        }
    }
    visitProgram(node) { 
        this.visitNodes(node.body); 
        return;
    }

    // TODO: Check here for require statements
    visitVariableDeclaration(node){ return this.visitNodes(node.declarations) }
    visitVariableDeclarator(node){}

    // TODO: Check here for imports, remember the file paths are relative, need to figure that out somehow
    visitImportDeclaration(node){
        let fileObj = this.output.find(file => file.id == this.curFileID);
    }

    visitFunctionDeclaration(node){
        let newFunction = this.buildFunctionObj(node.params, node.id.name);
        this.pushToFileObj(newFunction);

        return this.visitNodes(node.body.body);
    }

    visitMethodDefinition(node){
        let newMethod = this.buildFunctionObj(node.value.params, node.key.name);

        let classInfo = {
            "fromType": "Class",
            "className": this.class
        }
        newMethod["info"] = classInfo;
        this.pushToFileObj(newMethod);

        return this.visitNodes(node.value.body.body);
    }

    pushToFileObj(newObj){
        // Push the "function" object to the correct "file" object's array
        this.output.forEach(file => {
            if (file.id == this.curFileID){
                file.functions.push(newObj  );
            }
        });
    }

    buildFunctionObj(paramArray, name) {
        let paramCount = paramArray.length;

        // Rebuild the function signature
        let argumentString = "";
        if (paramCount > 1) {
            for (let i = 0; i < paramCount-1; i++) {
                argumentString += paramArray[i].name + ", ";
            }
        }
        if (paramCount > 0) {
            argumentString += paramArray[paramCount-1].name;
        }
        let signature = name + "(" + argumentString + ")";

        // Create a new "function" object to be pushed
        let newFunction = {
            "signature": signature,
            "name": name,
            "paramCount": paramCount,
            "calledBy": []
        }

        return newFunction;
    }

    visitExpressionStatement(node){ return this.visitNode(node.expression) }
    
    visitCallExpression(node){
        let callParamCount, callName;
        callParamCount = node.arguments.length;
        if (node.callee.type == "Identifier") {
            callName = node.callee.name;
        } else if (node.callee.type == "MemberExpression") {
            callName = node.callee.property.name;
        } else {
            console.log("Unrecognized type in CallExpression");
            return;
        }

        let validFunctionFound = false;
        // Search each "file" object for the appropriate function that is being called
        // TODO: Make this only check the current file, and files that have been imported 
        this.output.forEach(file => {
            // Don't check our temp object
            if (file.id != "temp"){
                file.functions.forEach(func => {
                    if (func.name == callName && func.paramCount == callParamCount) {
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
                            }
                            func.calledBy.push(calledByObj);
                        } else {
                        }
                    }
                })
            }
        });

        // If we can't find the matching function to this call, store it for later and try again
        // after all files are read through.
        if (validFunctionFound == false) {
            this.output.forEach(file => {
                if (file.id == "temp") {
                    let tempObj = {
                        "id": this.curFileID,
                        "name": callName,
                        "paramCount": callParamCount,
                        "atLineNum": [node.loc.start.line]
                    }
                    file.calls.push(tempObj);
                }
            });
        }

    }

    visitClassDeclaration(node){
        this.class = node.id.name;
        this.visitNodes(node.body.body);
        this.class = "";
    }

    visitExportNamedDeclaration(node){}
    visitIdentifier(node){ return node.name; }

    visitLiteral(node){/* Do nothing for now */};
}