'use strict';
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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const vscode_extension_common_1 = require("vscode-extension-common");
const fold = require("./Fold");
function activate(context) {
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.levelAtCursor', () => {
        warnFoldStrategy();
        fold.foldLevelOfCursor();
    });
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.levelAtCursor.unfold', () => {
        warnFoldStrategy();
        fold.unfoldLevelOfCursor();
    });
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.levelOfParent', () => {
        warnFoldStrategy();
        fold.foldLevelOfParent();
    });
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.children', () => {
        warnFoldStrategy();
        fold.foldChildren();
    });
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.parent', () => {
        warnFoldStrategy();
        const textEditor = vscode.window.activeTextEditor;
        const parentLine = vscode_extension_common_1.Lines.findNextLineUpSpacedLeft(textEditor.document, textEditor.selection.active.line, +textEditor.options.tabSize);
        textEditor.selection = new vscode.Selection(parentLine.lineNumber, 0, parentLine.lineNumber, 0);
        vscode.commands.executeCommand('editor.fold');
    });
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.selection', () => {
        warnFoldStrategy();
        const foldLines = vscode_extension_common_1.Lines.findAllLinesContainingCurrentWordOrSelection();
        fold.foldLines(foldLines);
    });
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.selection.unfold', () => __awaiter(this, void 0, void 0, function* () {
        warnFoldStrategy();
        const foldLines = vscode_extension_common_1.Lines.findAllLinesContainingCurrentWordOrSelection();
        const regexUnfold = vscode_extension_common_1.Lines.makeRegExpToMatchWordUnderCursorOrSelection(vscode.window.activeTextEditor.document, vscode.window.activeTextEditor.selection);
        yield fold.unfoldLines(foldLines, false);
        vscode_extension_common_1.View.moveCursorForwardUntilMatch(vscode.window.activeTextEditor, regexUnfold);
        vscode_extension_common_1.View.triggerWordHighlighting();
    }));
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.regex.unfold', () => __awaiter(this, void 0, void 0, function* () {
        warnFoldStrategy();
        const userInput = yield vscode.window.showInputBox({ prompt: 'regex to unfold lines', value: '' });
        if (!userInput)
            return;
        const regexUnfold = new RegExp(userInput);
        const foldLines = vscode_extension_common_1.Lines.findAllLineNumbersContaining(vscode.window.activeTextEditor.document, regexUnfold);
        if (foldLines.length) {
            yield fold.unfoldLines(foldLines, true);
            vscode_extension_common_1.View.moveCursorForwardUntilMatch(vscode.window.activeTextEditor, regexUnfold);
            vscode_extension_common_1.View.triggerWordHighlighting();
        }
        else {
            vscode.window.showWarningMessage("No lines found with '" + userInput + "'");
        }
    }));
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.selection.exclude', () => {
        warnFoldStrategy();
        const excludedLines = vscode_extension_common_1.Lines.findAllLinesContainingCurrentWordOrSelection();
        fold.foldAllExcept(excludedLines);
    });
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.cursor.exclude', () => {
        warnFoldStrategy();
        const textEditor = vscode.window.activeTextEditor;
        const selection = textEditor.selection;
        fold.foldAllExcept([selection.anchor.line]);
    });
    vscode_extension_common_1.Application.registerCommand(context, 'dakara-foldplus.toggle.indentation', () => __awaiter(this, void 0, void 0, function* () {
        const newValue = yield vscode_extension_common_1.Application.settingsCycleNext('editor', 'foldingStrategy', ['auto', 'indentation']);
        vscode.window.showInformationMessage('Set Folding Strategy: ' + newValue);
    }));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
function warnFoldStrategy() {
    const currentFoldingStrategy = vscode.workspace.getConfiguration('editor').get('foldingStrategy');
    if (currentFoldingStrategy === 'auto')
        vscode.window.showWarningMessage("Fold Plus features require 'indentation' folding.  Use command `Fold Plus: Toggle Indentation/Language Folding` to set 'indentation' folding when using Fold Plus");
}
//# sourceMappingURL=extension.js.map