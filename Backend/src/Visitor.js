import path from 'path';

export default class Visitor {
    constructor(output, curFileID) {
        this.curFileID = curFileID;
        this.output = output;
    }

    visitNodes(nodes, vars) { 
        // Handle if we are given a second argument "vars", representing variables from higher levels of scope
        // Additionally, copy this array of variables so that changes down this part of the tree won't propogate to other branches.
        let variables = [];
        if (typeof vars != "undefined") { variables = JSON.parse(JSON.stringify(vars)) } // Hack to pass a copy of the object (by value)

        // We do a first run through to identify variable declarations, also called "hoisting"
        // This is necessary to obtain proper scope and identify which methods are being called
        for (let node of nodes) {
            if (node.type == 'VariableDeclaration') {
                this.visitVariableDeclaration(node, variables);
            }
        }

        // Do a second pass for everything else
        for (let node of nodes) {
            if (node.type != 'VariableDeclaration') {
                this.visitNode(node, variables); 
            }
        }
    }

    visitNode(node, variables) {

        // Dynamic dispatch for each node type in the AST
        switch (node.type) {
            case 'Program': return this.visitProgram(node);
            case 'ImportDeclaration': return this.visitImportDeclaration(node);
            case 'ExportNamedDeclaration': return this.visitExportNamedDeclaration(node);
            case 'FunctionDeclaration': return this.visitFunctionDeclaration(node, variables);
            case 'Identifier': return this.visitIdentifier(node);
            case 'Literal': return this.visitLiteral(node);
            case 'ExpressionStatement': return this.visitExpressionStatement(node, variables);
            case 'CallExpression': return this.visitCallExpression(node, variables);
            case 'ClassDeclaration': return this.visitClassDeclaration(node, variables);
            case 'MethodDefinition': return this.visitMethodDefinition(node, variables);
            case 'AssignmentExpression': return this.visitAssignmentExpression(node, variables);
            case 'ArrowFunctionExpression': return this.visitArrowFunctionExpression(node, variables);
            case 'BlockStatement': return this.visitBlockStatement(node, variables);
        }
    }

    visitProgram(node) { 
        this.visitNodes(node.body);
    }

    visitBlockStatement(node, vars){
        this.visitNodes(node.body, vars);
    }

    visitVariableDeclaration(node, vars){
        // TODO: Check here for require statements, track them as imports

        // Keeps track of variables, adds additional class key to object if initialized to new object.
        node.declarations.forEach(declaration => {
            let matchingVar = vars.findIndex(variable => {
                return variable.name == declaration.id.name;
            });
            
            // Push a new "variable" object
            if (matchingVar == -1) {
                let type;
                if (declaration.init != null) {
                    type = declaration.init.type;
                } else {
                    type = null;
                }
                let variable = {
                    "name": declaration.id.name,
                    "type": type
                }
                if (declaration.init == "NewExpression") {
                    variable["class"] = declaration.init.callee.name;
                }
                vars.push(variable);

            /** Edit an existing "variable" object. This handles the case where
             *  two variables have the same name but different scopes. We overwrite 
             *  the more global value with the local one */
            } else {
                vars[matchingVar].type = declaration.init;
                if (declaration.init == "NewExpression") {
                    vars[matchingVar].class = declaration.init.callee.name;
                }
            }
        });
    }

    // Update the variable array with changes made (This is limited, static, check, not a compiler)
    visitAssignmentExpression(node, variables){
        if (node.left.type == "Identifier") {
            variables.forEach(variable => {
                if (variable.name == node.left.name) {
                    variable.type = node.right.type;
                    if (variable.type == "NewExpression"){
                        variable["class"] = node.right.callee.name;
                    }
                }
            });
        } else if (node.left.type == "MemberExpression") {
            // Not currently supported, (eg. example.name = 1;)
        } else {
            console.log("Unhandled Expression, '" + node.left.type + "' discarded");
        }
        this.visitNode(node.right, variables);
    }

    visitArrowFunctionExpression(node, vars){
        this.visitNode(node.body, vars);
    }

    // Match imports to their respective files, if not found, add information to temp file to try again later.
    visitImportDeclaration(node){
        let curFileObj = this.output.find(file => { return file.id == this.curFileID });
        let importPath = path.join(curFileObj.filePath, "..", node.source.value);
        let importedFileObj = this.output.find(file => { return importPath == file.filePath });
        if (importedFileObj) {
            curFileObj.imports.push(importedFileObj.id);
            importedFileObj.importedInFiles.push(this.curFileID);
        } else {
            let tempFileObj = this.output.find(file => { return file.id == "temp" });
            let newTempObj = {
                "filePath": importPath,
                "importeeFileID": this.curFileID
            }
            tempFileObj.imports.push(newTempObj);
        }
    }

    visitFunctionDeclaration(node, vars){
        let newFunction = this.buildFunctionObj(node.params, node.id.name, node.loc.start.line, node.loc.end.line);
        newFunction["type"] = "Functional";
        this.pushToFileObj(newFunction);

        return this.visitNodes(node.body.body, vars);
    }

    visitMethodDefinition(node, vars){
        let newMethod = this.buildFunctionObj(node.value.params, node.key.name);
        newMethod["type"] = "OOP";
        newMethod["className"] = this.class;
        this.pushToFileObj(newMethod);

        return this.visitNodes(node.value.body.body, vars);
    }

    pushToFileObj(newObj){
        // Push the "function" object to the correct "file" object's array
        this.output.forEach(file => {
            if (file.id == this.curFileID){
                file.functions.push(newObj);
            }
        });
    }

    // Helper for building a function object that is pushed to output
    buildFunctionObj(paramArray, name, start, end) {
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
            "startLine": start,
            "endLine": end,
            "calledBy": []
        }

        return newFunction;
    }

    visitExpressionStatement(node, vars){ return this.visitNode(node.expression, vars) }
    
    visitCallExpression(node, vars){
        let callParamCount, callName, callClass, callType;
        callParamCount = node.arguments.length;

        // Handle function calls ( eg. call(x, y) )
        if (node.callee.type == "Identifier") {
            callName = node.callee.name;
            callType = "Functional";

        // Handle method calls ( eg. variable.call(x, y) )
        } else if (node.callee.type == "MemberExpression") {
            callName = node.callee.property.name;
            callType = "OOP";
            let objName = node.callee.object.name;

            let obj = vars.findIndex(variable => { return variable.name == objName});
            if (obj != -1 && vars[obj].type == "NewExpression") {
                callClass = vars[obj].class;
            } else {
                callClass = null;
            }
        } else {
            console.log("Unrecognized type in CallExpression");
            return;
        }

        let validFunctionFound = false;
        // Search each "file" object for the appropriate function that is being called
        // TODO: Make this only check the current file, and files that have been imported. To improve performance 
        this.output.forEach(file => {
            // Don't check our temp object, which is used to store calls that we can't match to functions yet
            if (file.id != "temp"){
                file.functions.forEach(func => {
                    // Check if the function/method matches the calls name, number of parameters, and class
                    if (func.name == callName 
                        && func.paramCount == callParamCount 
                        && (!callClass || callClass == func.className)) {
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

        /** If we can't find the matching function to this call, the file 
         *  where this function resides might not have been parsed yet. 
         *  Store it for later and try again after all files are read through. */
        if (validFunctionFound == false) {
            this.output.forEach(file => {
                if (file.id == "temp") {
                    let tempObj = {
                        "id": this.curFileID,
                        "name": callName,
                        "paramCount": callParamCount,
                        "type": callType,
                        "className": callClass,
                        "atLineNum": [node.loc.start.line]
                    }
                    file.calls.push(tempObj);
                }
            });
        }

        // Additionally, visit any nodes that may be in the arguments area (eg. example(func => { console.log() }))
        this.visitNodes(node.arguments, vars);

    }

    visitClassDeclaration(node, vars){
        // Allows us to label any functions found as children of this node are actually methods of this class
        this.class = node.id.name;
        this.visitNodes(node.body.body, vars);
        this.class = "";
        // TODO: Extends

    }

    visitExportNamedDeclaration(node){}
    visitIdentifier(node){ return node.name; }

    visitLiteral(node){/* Do nothing for now */};
}