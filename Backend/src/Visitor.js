export default class Visitor {
    constructor(output, curFileID) {
        this.curFileID = curFileID;
        this.output = output;
    }

    visitNodes(nodes, vars) { 
        // Handle if we are given a second argument "vars", representing variables from higher levels of scope
        let variables = [];
        if (typeof vars != 'undefined') {
            variables = vars;
        }

        // We do a first run through to identify variable declarations, also called "hoisting"
        // This is necessary to obtain proper scope and identify which methods are being called
        for (let node of nodes) {
            if (node.type == 'VariableDeclaration') {
                variables.push(...this.visitVariableDeclaration(node, variables));
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
        let variables = [];
        if (typeof vars != "undefined") { variables = vars }

        // Dynamic dispatch for each node type in the AST
        switch (node.type) {
            case 'Program': return this.visitProgram(node, variables);
            case 'ImportDeclaration': return this.visitImportDeclaration(node);
            case 'ExportNamedDeclaration': return this.visitExportNamedDeclaration(node);
            case 'FunctionDeclaration': return this.visitFunctionDeclaration(node, variables);
            case 'Identifier': return this.visitIdentifier(node);
            case 'Literal': return this.visitLiteral(node);
            case 'ExpressionStatement': return this.visitExpressionStatement(node);
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
        let variables = vars;
        node.declarations.forEach(declaration => {
            let matchingVar = variables.findIndex(variable => {
                variable.name == declaration.id.name;
            });
            
            // Push a new "variable" object
            if (matchingVar == -1) {
                let variable = {
                    "name": declaration.id.name,
                    "type": declaration.init,
                }
                if (declaration.init == "NewExpression") {
                    variable["class"] = declaration.init.callee.name;
                }
                variables.push(variable);

            /** Edit an existing "variable" object. This handles the case where
             *  two variables have the same name but different scopes. We overwrite 
             *  the more global value with the local one */
            } else {
                variables[matchingVar].type = declaration.init;
                if (declaration.init == "NewExpression") {
                    variables[matchingVar].class = declaration.init.callee.name;
                }
            }
        });
        return variables;
    }

    // TODO: Check here for imports, remember the file paths are relative, need to figure that out somehow
    visitImportDeclaration(node){
        let fileObj = this.output.find(file => file.id == this.curFileID);
    }

    visitFunctionDeclaration(node, vars){
        let newFunction = this.buildFunctionObj(node.params, node.id.name);
        this.pushToFileObj(newFunction);

        return this.visitNodes(node.body.body, vars);
    }

    visitMethodDefinition(node, vars){
        let newMethod = this.buildFunctionObj(node.value.params, node.key.name);

        let classInfo = {
            "fromType": "Class",
            "className": this.class
        }
        newMethod["info"] = classInfo;
        this.pushToFileObj(newMethod);

        return this.visitNodes(node.value.body.body, vars);
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
    
    visitCallExpression(node, vars){
        let callParamCount, callName;
        callParamCount = node.arguments.length;

        // Handle function calls ( eg. call(x, y) )
        if (node.callee.type == "Identifier") {
            callName = node.callee.name;

        // Handle method calls ( eg. variable.call(x, y) )
        } else if (node.callee.type == "MemberExpression") {
            callName = node.callee.property.name;
        } else {
            console.log("Unrecognized type in CallExpression");
            return;
        }

        let validFunctionFound = false;
        // Search each "file" object for the appropriate function that is being called
        // TODO: Make this only check the current file, and files that have been imported 
        // TODO: Make this more accurate for method calls by checking the variables class
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

    visitClassDeclaration(node, vars){
        this.class = node.id.name;
        this.visitNodes(node.body.body, vars);
        this.class = "";
    }

    visitExportNamedDeclaration(node){}
    visitIdentifier(node){ return node.name; }

    visitLiteral(node){/* Do nothing for now */};
}