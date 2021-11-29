export default class Visitor {
    constructor(output, curFileID) {
        this.curFileID = curFileID;
        this.output = output;
    }

    visitNodes(nodes, vars) { 
        // We do a first run through to identify variable declarations, also called "hoisting"
        // This is necessary to obtain proper scope and identify which methods are being called
        for (let node of nodes) {
            if (node.type == 'VariableDeclaration') {
                this.visitVariableDeclaration(node, vars);
            }
        }

        // Do a second pass for everything else
        for (let node of nodes) {
            if (node.type != 'VariableDeclaration') {
                this.visitNode(node, vars); 
            }
        }
    }

    visitNode(node, vars) {
        // Handle if we are given a second argument "vars", representing variables from higher levels of scope
        // Additionally, copy this array of variables so that changes won't propogate outside of this scope.
        let variables = [];
        if (typeof vars != "undefined") { variables = JSON.parse(JSON.stringify(vars)) } // Hack to pass a copy of the object (by value)

        // Dynamic dispatch for each node type in the AST
        switch (node.type) {
            case 'Program': return this.visitProgram(node, variables);
            case 'ImportDeclaration': return this.visitImportDeclaration(node);
            case 'ExportNamedDeclaration': return this.visitExportNamedDeclaration(node);
            case 'FunctionDeclaration': return this.visitFunctionDeclaration(node, variables);
            case 'Identifier': return this.visitIdentifier(node);
            case 'Literal': return this.visitLiteral(node);
            case 'ExpressionStatement': return this.visitExpressionStatement(node, variables);
            case 'CallExpression': return this.visitCallExpression(node, variables);
            case 'ClassDeclaration': return this.visitClassDeclaration(node, variables);
            case 'MethodDefinition': return this.visitMethodDefinition(node, variables);
        }
    }

    visitProgram(node, vars) { 
        this.visitNodes(node.body, vars);
    }

    visitVariableDeclaration(node, vars){
        // TODO: Check here for require statements, track them as imports

        // Keeps track of variables, adds additional class key to object if initialized to new object.
        node.declarations.forEach(declaration => {
            let matchingVar = vars.findIndex(variable => {
                variable.name == declaration.id.name;
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

    // TODO: Check here for imports, remember the file paths are relative, need to figure that out somehow
    visitImportDeclaration(node){
        let fileObj = this.output.find(file => file.id == this.curFileID);
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
        let callParamCount, callName, callClass;
        callParamCount = node.arguments.length;

        // Handle function calls ( eg. call(x, y) )
        if (node.callee.type == "Identifier") {
            callName = node.callee.name;

        // Handle method calls ( eg. variable.call(x, y) )
        } else if (node.callee.type == "MemberExpression") {
            callName = node.callee.property.name;
            let objName = node.callee.object.name;

            let obj = vars.find(variable => {variable.name == objName});
            if (obj && obj.type == "NewExpression") {
                callClass = obj.class;
            }
        } else {
            console.log("Unrecognized type in CallExpression");
            return;
        }

        let validFunctionFound = false;
        // Search each "file" object for the appropriate function that is being called
        // TODO: Make this only check the current file, and files that have been imported 
        // TODO: Make this more accurate for method calls by checking the variables class
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
                        "atLineNum": [node.loc.start.line]
                    }
                    file.calls.push(tempObj);
                }
            });
        }

    }

    visitClassDeclaration(node, vars){
        // Allows us to label any functions found as children of this node are actually methods of this class
        this.class = node.id.name;
        this.visitNodes(node.body.body, vars);
        this.class = "";
    }

    visitExportNamedDeclaration(node){}
    visitIdentifier(node){ return node.name; }

    visitLiteral(node){/* Do nothing for now */};
}