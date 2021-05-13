"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode;
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const GenerateBar = require("./generateBar");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "commentbars" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(vscode_1.commands.registerCommand('commentbars.generateAdvanced', () => {
        GenerateBar.commentBarGenerateCommand(true);
    }));
    context.subscriptions.push(vscode_1.commands.registerCommand('commentbars.generateQuick', () => {
        GenerateBar.commentBarGenerateCommand(false);
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map