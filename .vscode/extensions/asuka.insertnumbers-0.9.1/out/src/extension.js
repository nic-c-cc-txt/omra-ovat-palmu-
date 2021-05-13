'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var NumInserter_1 = require('./NumInserter');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    //console.log('Congratulations, your extension "insertnumbers" is now active!');
    var settings = new NumInserter_1.InsertSettngs();
    var inserter = new NumInserter_1.NumInserter(settings);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.insertNumbers', function () {
        // The code you place here will be executed every time your command is executed
        inserter.processInsert();
        // Display a message box to the user
        //vscode.window.showInformationMessage('Insert Numbers!');
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(settings);
    context.subscriptions.push(inserter);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map