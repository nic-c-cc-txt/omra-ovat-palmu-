'use strict';
const vscode = require('vscode');
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.closeAll', () => {
        vscode.commands.executeCommand('workbench.action.closeEditorsInGroup');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map