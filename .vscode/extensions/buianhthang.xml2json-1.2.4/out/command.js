"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const document_1 = require("./document");
const config_1 = require("./config");
const { parseString } = require('xml2js');
const clipboardy = require('clipboardy');
const DOCUMENT_ERROR = 'Selection or document is invalid XML???';
const CLIPBOARD_ERROR = 'Clipboard is invalid XML???';
class Command {
    static convertDocument() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.selection && activeEditor.selection.active) {
            activeEditor.edit(editor => {
                const select = activeEditor.document.getText(activeEditor.selection);
                let input = select || activeEditor.document.getText();
                const callback = (err, result) => {
                    if (err || !result) {
                        vscode.window.showErrorMessage(DOCUMENT_ERROR);
                    }
                    else {
                        const output = JSON.stringify(result, null, 2);
                        if (select) {
                            document_1.Document.replaceSelection(editor, activeEditor.selection, output);
                        }
                        else {
                            document_1.Document.replaceDocument(editor, activeEditor.document, output);
                        }
                    }
                };
                this._parser(input, callback);
            });
        }
    }
    static convertClipboard() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && activeEditor.selection && activeEditor.selection.active) {
            activeEditor.edit(editor => {
                const select = activeEditor.document.getText(activeEditor.selection);
                let input = clipboardy.readSync();
                const callback = (err, result) => {
                    if (err || !result) {
                        vscode.window.showErrorMessage(CLIPBOARD_ERROR);
                    }
                    else {
                        const output = JSON.stringify(result, null, 2);
                        if (select) {
                            document_1.Document.replaceSelection(editor, activeEditor.selection, output);
                        }
                        else {
                            document_1.Document.insert(editor, activeEditor.selection, output);
                        }
                    }
                };
                this._parser(input, callback);
            });
        }
    }
    static _parser(input, callback) {
        const builder = config_1.Config.defaultSettings;
        switch (builder) {
            case 'xml2js':
                parseString(input, callback);
                break;
            case 'xmlbuilder':
            case 'custom':
                const opts = config_1.Config[builder];
                parseString(input, opts, callback);
                break;
        }
    }
}
exports.Command = Command;
//# sourceMappingURL=command.js.map