"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const util_1 = require("util");
let g_terminal;
let terminal_open = false;
function activate(context) {
    console.log('Activating extension AMPL');
    let disposable_1 = vscode.commands.registerCommand('ampl.openConsole', openAMPLConsole);
    let disposable_2 = vscode.commands.registerCommand('ampl.runFile', () => {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        let document = editor.document;
        if (document.isUntitled) {
            document.save();
        }
        else {
            let name = document.fileName;
            if (vscode.workspace.getConfiguration('ampl').get('useRelativePath')) {
                name = vscode.workspace.asRelativePath(document.fileName);
            }
            let ext = path.extname(document.fileName);
            if (ext == '.dat') {
                writeToConsole(`data "${name}";`);
            }
            else if (ext == '.mod') {
                writeToConsole(`model "${name}";`);
            }
            else if (ext == '.run') {
                writeToConsole(`include "${name}"`);
            }
        }
    });
    context.subscriptions.push(disposable_1);
    context.subscriptions.push(disposable_2);
    vscode.window.onDidCloseTerminal((terminal) => {
        if (terminal === g_terminal) {
            terminal_open = false;
        }
    });
}
exports.activate = activate;
function openAMPLConsole() {
    openConsole();
    let path = vscode.workspace.getConfiguration('ampl').get('pathToExecutable');
    if (path === "" || util_1.isUndefined(path)) {
        path = "ampl";
    }
    g_terminal.sendText(path);
}
exports.openAMPLConsole = openAMPLConsole;
function writeToConsole(msg) {
    if (!terminal_open) {
        openAMPLConsole();
    }
    g_terminal.sendText(msg);
}
function openConsole() {
    g_terminal = vscode.window.createTerminal({ name: "AMPL" });
    terminal_open = true;
    g_terminal.show(true);
}
//# sourceMappingURL=extension.js.map