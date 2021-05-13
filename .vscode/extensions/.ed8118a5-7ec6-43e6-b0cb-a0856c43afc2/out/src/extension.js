'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const filesExcludeKey = 'files.exclude';
const explorerExcludedFilesKey = 'explorerExcludedFiles';
const explorerExcludedFilesPatternsKey = 'explorerExcludedFiles.patterns';
const explorerExcludedFilesShowKey = 'explorerExcludedFiles.show';
const cycleDelay = 2500;
function getCodeName() {
    return `Code${/insider/i.test(vscode.version) ? ' - Insiders' : ''}`;
}
function getUserConfigurationFilePath() {
    if (/^linux/i.test(process.platform)) {
        return `${process.env.HOME}/.config/${getCodeName()}/User/settings.json`;
    }
    if (/^win/i.test(process.platform)) {
        return `${process.env.APPDATA}\\${getCodeName()}\\User\\settings.json`;
    }
    if (/^darwin/i.test(process.platform)) {
        return `${process.env.HOME}/Library/Application Support/${getCodeName()}/User/settings.json`;
    }
}
function readUTF8(filePath) {
    return fs.readFileSync(filePath, { encoding: 'utf8' });
}
function writeUTF8(filePath, data) {
    fs.writeFileSync(filePath, data, { encoding: 'utf8' });
}
function sanitizeJSONString(jsonString) {
    if (!jsonString) {
        return jsonString;
    }
    return jsonString.replace(/^[^{]+|[^}]+$/, '').replace(/(.+?[^:])\/\/.+$/gm, '$1');
}
function readJSON(filepath) {
    return sanitizeJSONString(readUTF8(filepath));
}
function JSONStringify(json) {
    return JSON.stringify(json, null, 2);
}
function configurationsAreIdentical(configuration1, configuration2) {
    return _.isEqual(configuration1, configuration2);
}
function readUserConfiguration() {
    const userConfigurationFilePath = getUserConfigurationFilePath();
    const userConfigurationText = readJSON(userConfigurationFilePath);
    const userConfiguration = JSON.parse(userConfigurationText);
    return {
        text: userConfigurationText,
        json: userConfiguration,
    };
}
function writeUserConfiguration(userConfiguration) {
    const userConfigurationFilePath = getUserConfigurationFilePath();
    writeUTF8(userConfigurationFilePath, JSONStringify(userConfiguration));
}
function start() {
    if (!vscode.workspace.workspaceFolders || !vscode.workspace.workspaceFolders.length) {
        restart();
        return;
    }
    const promises = [];
    vscode.workspace.workspaceFolders.forEach(workspaceFolder => {
        promises.push(new Promise((resolve) => {
            patchUserConfiguration(workspaceFolder, resolve);
        }));
    });
    Promise.all(promises).then(() => restart());
}
function restart() {
    setTimeout(start, cycleDelay);
}
function readWorkspaceConfiguration(workspaceFolder) {
    const emptyConfiguration = {
        text: '{}',
        json: {},
    };
    if (!workspaceFolder || !workspaceFolder.uri) {
        return emptyConfiguration;
    }
    const rootPath = workspaceFolder.uri.fsPath;
    const workspaceConfigurationFilePath = path.join(rootPath, '.vscode', 'settings.json');
    if (!fs.existsSync(workspaceConfigurationFilePath)) {
        return emptyConfiguration;
    }
    const workspaceConfigurationText = readJSON(workspaceConfigurationFilePath);
    return {
        text: workspaceConfigurationText,
        json: JSON.parse(workspaceConfigurationText),
    };
}
function writeWorkspaceConfiguration(workspaceFolder, workspaceConfiguration) {
    if (!workspaceFolder || !workspaceFolder.uri) {
        return;
    }
    const rootPath = workspaceFolder.uri.fsPath;
    if (!rootPath) {
        return;
    }
    const workspaceVSCodeDirectoryPath = path.join(rootPath, '.vscode');
    if (!fs.existsSync(workspaceVSCodeDirectoryPath)) {
        fs.mkdirSync(workspaceVSCodeDirectoryPath);
    }
    writeUTF8(path.join(workspaceVSCodeDirectoryPath, 'settings.json'), JSONStringify(workspaceConfiguration));
}
function clearWorkspaceConfiguration(workspaceFolder) {
    if (!workspaceFolder || !workspaceFolder.uri) {
        return;
    }
    const rootPath = workspaceFolder.uri.fsPath;
    if (!rootPath) {
        return;
    }
    const { text: workspaceConfigurationText, json: workspaceConfiguration } = readWorkspaceConfiguration(workspaceFolder);
    Object.keys(workspaceConfiguration[filesExcludeKey] || {}).forEach(e => {
        if (workspaceConfiguration[filesExcludeKey][e] === 'explorerExcludedFiles') {
            delete workspaceConfiguration[filesExcludeKey][e];
        }
    });
    if (!Object.keys(workspaceConfiguration[filesExcludeKey] || {}).length) {
        delete workspaceConfiguration[filesExcludeKey];
    }
    if (workspaceConfiguration[explorerExcludedFilesShowKey]) {
        if (!configurationsAreIdentical(workspaceConfiguration, JSON.parse(workspaceConfigurationText))) {
            writeWorkspaceConfiguration(workspaceFolder, workspaceConfiguration);
        }
        return;
    }
    const workspaceConfigurationKeys = Object.keys(workspaceConfiguration);
    if (!workspaceConfigurationKeys.length ||
        (workspaceConfigurationKeys.length === 1 &&
            typeof (workspaceConfiguration[explorerExcludedFilesShowKey]) !== 'undefined' &&
            !workspaceConfiguration[explorerExcludedFilesShowKey])) {
        const workspaceVSCodeDirectoryPath = path.join(rootPath, '.vscode');
        const workspaceVSCodeDirectoryEntries = fs.existsSync(workspaceVSCodeDirectoryPath)
            ? fs.readdirSync(workspaceVSCodeDirectoryPath)
            : [];
        if (workspaceVSCodeDirectoryEntries.length === 1 && workspaceVSCodeDirectoryEntries[0] === 'settings.json') {
            fs.unlinkSync(path.join(workspaceVSCodeDirectoryPath, 'settings.json'));
            fs.rmdirSync(workspaceVSCodeDirectoryPath);
        }
        return;
    }
    if (!configurationsAreIdentical(workspaceConfiguration, JSON.parse(workspaceConfigurationText))) {
        writeWorkspaceConfiguration(workspaceFolder, workspaceConfiguration);
    }
}
function clearWorkspaceConfigurations() {
    (vscode.workspace.workspaceFolders || []).forEach(workspaceFolder => clearWorkspaceConfiguration(workspaceFolder));
}
function patchWorkspaceConfiguration(workspaceFolder, patterns) {
    patterns = patterns || [];
    if (!workspaceFolder || !workspaceFolder.uri) {
        return;
    }
    const rootPath = workspaceFolder.uri.fsPath;
    if (!rootPath) {
        return;
    }
    const { text: workspaceConfigurationText, json: workspaceConfiguration } = readWorkspaceConfiguration(workspaceFolder);
    if (workspaceConfiguration[explorerExcludedFilesShowKey]) {
        return;
    }
    if (!workspaceConfiguration[filesExcludeKey]) {
        workspaceConfiguration[filesExcludeKey] = {};
    }
    patterns.forEach(pattern => {
        if (/^file:\/\//i.test(pattern)) {
            const filePath = path.join(rootPath, pattern.replace(/^file:\/\//i, ''));
            if (fs.existsSync(filePath)) {
                readUTF8(filePath).split(/\r?\n/g).map(p => p.trim()).filter(p => !/^\s*$/.test(p) && p[0] !== '#')
                    .map(p => p.replace(/^\/+/, '')).filter(p => typeof (workspaceConfiguration[filesExcludeKey][p]) === 'undefined')
                    .forEach(p => workspaceConfiguration[filesExcludeKey][p] = 'explorerExcludedFiles');
            }
            return;
        }
        if (typeof (workspaceConfiguration[filesExcludeKey][pattern]) === 'undefined') {
            workspaceConfiguration[filesExcludeKey][pattern] = 'explorerExcludedFiles';
        }
    });
    if (!configurationsAreIdentical(workspaceConfiguration, JSON.parse(workspaceConfigurationText))) {
        writeWorkspaceConfiguration(workspaceFolder, workspaceConfiguration);
    }
}
function patchUserConfiguration(workspaceFolder, promiseResolver) {
    if (!workspaceFolder || !workspaceFolder.uri) {
        return;
    }
    const rootPath = workspaceFolder.uri.fsPath;
    const { text: userConfigurationText, json: userConfiguration } = readUserConfiguration();
    let explorerExcludedFilesPatterns = vscode.workspace.getConfiguration(explorerExcludedFilesKey).get('patterns');
    if (!explorerExcludedFilesPatterns) {
        userConfiguration[explorerExcludedFilesPatternsKey] = ['file://.gitignore'];
        explorerExcludedFilesPatterns = userConfiguration[explorerExcludedFilesPatternsKey];
    }
    if (!configurationsAreIdentical(userConfiguration, JSON.parse(userConfigurationText))) {
        writeUserConfiguration(userConfiguration);
    }
    clearWorkspaceConfiguration(workspaceFolder);
    if (!rootPath) {
        promiseResolver();
        return;
    }
    patchWorkspaceConfiguration(workspaceFolder, explorerExcludedFilesPatterns);
    promiseResolver();
}
function toggleExplorerExcludedFiles(show) {
    (vscode.workspace.workspaceFolders || []).forEach((workspaceFolder) => {
        if (!workspaceFolder || !workspaceFolder.uri) {
            return;
        }
        const rootPath = workspaceFolder.uri.fsPath;
        if (!rootPath) {
            return;
        }
        const { json: workspaceConfiguration } = readWorkspaceConfiguration(workspaceFolder);
        if ((show && workspaceConfiguration[explorerExcludedFilesShowKey]) ||
            (!show && !workspaceConfiguration[explorerExcludedFilesShowKey])) {
            return;
        }
        workspaceConfiguration[explorerExcludedFilesShowKey] = show;
        writeWorkspaceConfiguration(workspaceFolder, workspaceConfiguration);
    });
}
function onDidChangeWorkspaceFolders(event) {
    (event.removed || []).forEach(clearWorkspaceConfiguration);
}
function activate(context) {
    vscode.workspace.onDidChangeWorkspaceFolders(event => onDidChangeWorkspaceFolders(event));
    start();
    const commandShowProjectExcludedFiles = vscode.commands.registerCommand('extension.showExplorerExcludedFiles', () => toggleExplorerExcludedFiles(true));
    const commandHideProjectExcludedFiles = vscode.commands.registerCommand('extension.hideExplorerExcludedFiles', () => toggleExplorerExcludedFiles(false));
    context.subscriptions.push(commandShowProjectExcludedFiles, commandHideProjectExcludedFiles);
}
exports.activate = activate;
function deactivate(context) {
    clearWorkspaceConfigurations();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map