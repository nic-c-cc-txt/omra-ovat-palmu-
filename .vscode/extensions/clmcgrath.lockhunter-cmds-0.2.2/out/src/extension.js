'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Lockhunter_1 = require("./Lockhunter");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand("lockhunter.view.current.directory", () => Lockhunter_1.Lockhunter.viewFileDirectory()));
    context.subscriptions.push(vscode.commands.registerCommand("lockhunter.view.current.file", () => Lockhunter_1.Lockhunter.viewFile()));
    context.subscriptions.push(vscode.commands.registerCommand("lockhunter.view.current.workspace", () => Lockhunter_1.Lockhunter.viewWorkspace()));
    context.subscriptions.push(vscode.commands.registerCommand("lockhunter.unlock.current.directory", () => Lockhunter_1.Lockhunter.unlockFileDirectory()));
    context.subscriptions.push(vscode.commands.registerCommand("lockhunter.unlock.current.file", () => Lockhunter_1.Lockhunter.unlockFile()));
    context.subscriptions.push(vscode.commands.registerCommand("lockhunter.unlock.current.workspace", () => Lockhunter_1.Lockhunter.unlockWorkspace()));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map