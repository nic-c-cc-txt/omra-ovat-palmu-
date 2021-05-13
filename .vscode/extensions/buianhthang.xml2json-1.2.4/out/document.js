"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const SUCCESSFUL = 'Converted successful!';
class Document {
    static replaceSelection(editor, selection, data) {
        editor.replace(selection, data);
        vscode.window.showInformationMessage(SUCCESSFUL);
    }
    static replaceDocument(editor, document, data) {
        const lastLineIndex = (document.lineCount - 1);
        let range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(lastLineIndex, Number.MAX_VALUE));
        range = document.validateRange(range);
        editor.replace(range, data);
        vscode.window.showInformationMessage(SUCCESSFUL);
    }
    static insert(editor, selection, data) {
        editor.insert(selection.active, data);
        vscode.window.showInformationMessage(SUCCESSFUL);
    }
}
exports.Document = Document;
//# sourceMappingURL=document.js.map