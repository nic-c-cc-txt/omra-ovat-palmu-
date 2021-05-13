"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const config_1 = require("./config");
function getFolderOption(folders) {
    const options = folders.map(folder => folder.name);
    return vscode_1.window.showQuickPick(options, {
        placeHolder: config_1.PLACEHOLDERS.location,
    });
}
exports.getFolderOption = getFolderOption;
function getOverrideOption() {
    return vscode_1.window
        .showQuickPick(config_1.OVERRIDE_OPTIONS, {
        placeHolder: config_1.PLACEHOLDERS.override,
    })
        .then(option => {
        if (option === undefined) {
            return undefined;
        }
        return option === config_1.OVERRIDE_OPTIONS[0] ? true : false;
    });
}
exports.getOverrideOption = getOverrideOption;
function getItemsOption(items) {
    return vscode_1.window
        .showQuickPick(items, {
        canPickMany: true,
        placeHolder: config_1.PLACEHOLDERS.selection_hint,
    })
        .then(selected => {
        if (selected === undefined || selected.length === 0) {
            return undefined;
        }
        return selected.map(item => item.label);
    });
}
exports.getItemsOption = getItemsOption;
function openFile(filePath) {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.file(filePath));
}
exports.openFile = openFile;
function openUntitledFile(content) {
    vscode_1.workspace.openTextDocument({ content }).then(doc => {
        vscode_1.window.showTextDocument(doc);
    });
}
exports.openUntitledFile = openUntitledFile;
//# sourceMappingURL=ui.js.map