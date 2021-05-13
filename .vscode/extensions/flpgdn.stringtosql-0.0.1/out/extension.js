"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const formatters_1 = require("./formatters/formatters");
function getCorrectFormatter(text) {
    let rgxDoubleQuotes = new RegExp('^\\s*"');
    if (rgxDoubleQuotes.test(text)) {
        throw new Error("Formatter not available.");
    }
    return new formatters_1.DelphiFormatter();
}
function executeFormatting(currentEditor, format) {
    if (!currentEditor || currentEditor.document.lineCount === 0) {
        return;
    }
    let document = currentEditor.document;
    currentEditor.edit(editor => {
        for (let i = 0; i < document.lineCount; i++) {
            let lineText = document.lineAt(i);
            editor.replace(lineText.range, format(lineText, document.lineCount));
        }
    }).then(success => {
        if (success && currentEditor.selection) {
            currentEditor.selection = new vscode.Selection(currentEditor.selection.end, currentEditor.selection.end);
        }
    });
}
function activate(context) {
    let formatToSQL = vscode.commands.registerCommand('stringtosql.formatToSQL', () => {
        let currentEditor = vscode.window.activeTextEditor;
        if (!currentEditor)
            return;
        let formatter = getCorrectFormatter(currentEditor.document.getText());
        executeFormatting(currentEditor, formatter.formatToSQL);
    });
    let formattoString = vscode.commands.registerCommand('stringtosql.formatToString', () => {
        let currentEditor = vscode.window.activeTextEditor;
        if (!currentEditor)
            return;
        let formatter = getCorrectFormatter(currentEditor.document.getText());
        executeFormatting(currentEditor, formatter.formatToString);
    });
    context.subscriptions.push(formatToSQL, formattoString);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map