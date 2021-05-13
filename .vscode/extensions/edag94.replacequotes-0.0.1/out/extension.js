"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const replace_1 = require("./replace");
function activate(context) {
    console.log('Yay');
    const ReplaceSingle = vscode.commands.registerCommand('extension.ReplaceSingle', () => {
        if (vscode.window.activeTextEditor !== undefined) {
            const textEditor = vscode.window.activeTextEditor;
            replace_1.default(textEditor, true);
        }
    });
    const ReplaceDouble = vscode.commands.registerCommand('extension.ReplaceDouble', () => {
        if (vscode.window.activeTextEditor !== undefined) {
            const textEditor = vscode.window.activeTextEditor;
            replace_1.default(textEditor, false);
        }
    });
    context.subscriptions.push(ReplaceSingle, ReplaceDouble);
}
exports.activate = activate;
function deactivate() {
    console.log(':(');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map