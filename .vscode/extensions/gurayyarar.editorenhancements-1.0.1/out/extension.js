"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const CommandHelpers_1 = require("./helpers/CommandHelpers");
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.editorEnhancement', () => __awaiter(this, void 0, void 0, function* () {
        vscode.window.showQuickPick(new CommandHelpers_1.CommandHelpers().getAllCommands()).then((reason) => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;
                const resultStr = new CommandHelpers_1.CommandHelpers().getCommandResult(editor.document.getText(selection), reason.commandName);
                editor.edit(p => p.replace(selection, resultStr));
            }
        });
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map