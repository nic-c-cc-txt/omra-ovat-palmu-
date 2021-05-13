"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const micromustache_1 = require("micromustache");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    context.subscriptions.push(vscode.commands.registerTextEditorCommand("print-it.PrintIt", printIt));
}
exports.activate = activate;
// this method is called when your extension is deactivated
// eslint-disable-next-line
function deactivate() { }
exports.deactivate = deactivate;
function printIt() {
    return __awaiter(this, void 0, void 0, function* () {
        const currentEditor = vscode.window.activeTextEditor;
        if (!currentEditor) {
            return;
        }
        const sel = currentEditor.selection;
        const len = sel.end.character - sel.start.character;
        const range = len === 0
            ? currentEditor.document.getWordRangeAtPosition(sel.anchor)
            : new vscode.Range(sel.start, sel.end);
        if (range === undefined) {
            throw new Error("NO_WORD");
        }
        const doc = currentEditor.document;
        const lineNumber = range.start.line;
        const item = doc.getText(range);
        const idx = doc.lineAt(lineNumber).firstNonWhitespaceCharacterIndex;
        const ind = doc.lineAt(lineNumber).text.substring(0, idx);
        const line = lineNumber;
        const lastLine = doc.lineCount - 1 === lineNumber;
        const scope = {
            escaped: escaped(item, currentEditor.document.languageId),
            raw: item,
        };
        let template = vscode.workspace
            .getConfiguration("print-it")
            .get(`${currentEditor.document.languageId}.template`);
        if (!template) {
            template = vscode.workspace
                .getConfiguration("print-it")
                .get("default.template");
        }
        if (!template) {
            // fallback = javascript
            template = 'console.log("{{escaped}}", {{raw}});';
        }
        const txt = micromustache_1.render(template, scope);
        let nxtLine;
        let nxtLineInd;
        if (!lastLine) {
            nxtLine = doc.lineAt(line + 1);
            nxtLineInd = nxtLine.text.substring(0, nxtLine.firstNonWhitespaceCharacterIndex);
        }
        else {
            nxtLineInd = "";
        }
        yield currentEditor.edit((e) => {
            e.insert(new vscode.Position(line, doc.lineAt(line).range.end.character), "\n".concat(nxtLineInd > ind ? nxtLineInd : ind, txt));
        });
        currentEditor.selection = sel;
    });
}
function escaped(selection, languageId) {
    switch (languageId) {
        // fallback = javascript
        default:
            return selection.replace(/"/g, `\\"`);
        case "ruby":
        case "erb":
        case "elixir":
            return selection.replace(/"/g, `\\"`).replace(/#/g, "\\#");
        case "php":
            return selection.replace(/"/g, `\\"`).replace(/\$/g, "\\$");
        case "shellscript":
            return selection.replace(/'/g, `'"'"'`);
    }
}
//# sourceMappingURL=extension.js.map