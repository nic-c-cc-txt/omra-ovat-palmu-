'use strict';
var ignoregit_1 = require('./ignoregit');
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var fs = require("fs");
var ignoregit = require("./ignoregit");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "ignoregit" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposableIgnoreFile = vscode.commands.registerCommand('ignoregit.ignoreFile', function (args) {
        var ig = new ignoregit.IgnoreGit();
        var isPresent = ig.IsGitIgnorePresent();
        var path = args._fsPath;
        if (isPresent) {
            var isDir = fs.lstatSync(path).isDirectory();
            var type = ignoregit_1.IgnoreType.File;
            if (isDir) {
                type = ignoregit_1.IgnoreType.Folder;
            }
            path = path.replace(vscode.workspace.rootPath, "");
            if (ig.AddFile(path, type)) {
                vscode.window.showInformationMessage("Done!");
            }
            else {
                vscode.window.showErrorMessage("Something goes wrong");
            }
        }
        else {
            vscode.window.showErrorMessage("No .gitignore file founded, please init the repository");
        }
    });
    var disposableIgnoreExt = vscode.commands.registerCommand('ignoregit.ignoreExt', function (args) {
        var ig = new ignoregit.IgnoreGit();
        var isPresent = ig.IsGitIgnorePresent();
        var path = args._fsPath;
        if (isPresent) {
            var isDir = fs.lstatSync(path).isDirectory();
            var type = ignoregit_1.IgnoreType.File;
            if (!isDir) {
                type = ignoregit_1.IgnoreType.Extension;
                path = path.replace(vscode.workspace.rootPath, "");
                if (ig.AddExtension(path, type)) {
                    vscode.window.showInformationMessage("Done!");
                }
                else {
                    vscode.window.showErrorMessage("Something goes wrong");
                }
            }
            else {
                vscode.window.showErrorMessage("Folder doesn't has extension");
            }
        }
        else {
            vscode.window.showErrorMessage("No .gitignore file founded, please init the repository");
        }
    });
    var disposableIncludeFile = vscode.commands.registerCommand('ignoregit.includeFile', function (args) {
        var ig = new ignoregit.IgnoreGit();
        var isPresent = ig.IsGitIgnorePresent();
        var path = args._fsPath;
        if (isPresent) {
            var isDir = fs.lstatSync(path).isDirectory();
            var type = ignoregit_1.IgnoreType.File;
            if (isDir) {
                type = ignoregit_1.IgnoreType.Folder;
            }
            path = path.replace(vscode.workspace.rootPath, "");
            if (ig.RemoveFile(path)) {
                vscode.window.showInformationMessage("Done!");
            }
            else {
                vscode.window.showErrorMessage("Something goes wrong");
            }
        }
        else {
            vscode.window.showErrorMessage("No .gitignore file founded, please init the repository");
        }
    });
    var disposableIncludeExt = vscode.commands.registerCommand('ignoregit.includeExt', function (args) {
        var ig = new ignoregit.IgnoreGit();
        var isPresent = ig.IsGitIgnorePresent();
        var path = args._fsPath;
        if (isPresent) {
            var isDir = fs.lstatSync(path).isDirectory();
            var type = ignoregit_1.IgnoreType.File;
            if (!isDir) {
                type = ignoregit_1.IgnoreType.Extension;
                path = path.replace(vscode.workspace.rootPath, "");
                if (ig.RemoveExtension(path)) {
                    vscode.window.showInformationMessage("Done!");
                }
                else {
                    vscode.window.showErrorMessage("Something goes wrong");
                }
            }
            else {
                vscode.window.showErrorMessage("Folder doesn't has extension");
            }
        }
        else {
            vscode.window.showErrorMessage("No .gitignore file founded, please init the repository");
        }
    });
    context.subscriptions.push(disposableIgnoreFile);
    context.subscriptions.push(disposableIgnoreExt);
    context.subscriptions.push(disposableIncludeFile);
    context.subscriptions.push(disposableIncludeExt);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map