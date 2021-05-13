"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Generator_1 = require("./Generator");
function activate(context) {
    let disposable = vscode.commands.registerCommand("extension.gitignoreGenerate", () => {
        try {
            const generator = new Generator_1.default();
            generator.init();
        }
        catch (e) {
            console.log(e.message);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map