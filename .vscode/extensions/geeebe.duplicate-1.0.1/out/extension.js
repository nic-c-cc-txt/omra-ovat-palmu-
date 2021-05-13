"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('geeebe.duplicateText', duplicateText));
}
exports.activate = activate;
const LINE_ENDINGS = ['', '\n', '\r\n',];
function duplicateText() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const selections = editor.selections;
    editor.edit(textEdit => {
        selections.forEach((selection) => {
            if (selection.isEmpty) {
                //Duplicate line
                const text = editor.document.lineAt(selection.start.line).text;
                textEdit.insert(new vscode.Position(selection.start.line, 0), `${text}${LINE_ENDINGS[editor.document.eol]}`);
            }
            else {
                //Duplicate selection
                const text = editor.document.getText(selection);
                textEdit.insert(selection.start, text);
            }
        });
    });
}
//# sourceMappingURL=extension.js.map