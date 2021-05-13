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
const lodash_1 = require("lodash");
const fs_1 = require("fs");
const RedisProvider_1 = require("./RedisProvider");
const ConfigHelper_1 = require("./ConfigHelper");
const enum_1 = require("./enum");
const tempOutputFile = ".vscode/redis-xplorer.redis";
class RedisXplorer {
    constructor(context) {
        console.debug(context.storagePath);
        // Clean-up temp file
        fs_1.unlink(`${vscode.workspace.rootPath}/${tempOutputFile}`, err => { if (err) {
            console.log(err);
            return;
        } });
        this.configHelper = new ConfigHelper_1.ConfigHelper();
        this.treeDataProvider = new RedisProvider_1.RedisProvider();
        this.redisXplorer = vscode.window.createTreeView("redisXplorer", { treeDataProvider: this.treeDataProvider });
        this.setupVsCommands();
    }
    /**
     * Setup all VsCode related commands
     */
    setupVsCommands() {
        vscode.commands.registerCommand(enum_1.Command.ReadNodeData, (resource) => {
            this.lastAccessedNode = resource;
            // When refresh, it will execute getTreeItem in provider.
            return this.openResource(resource);
        });
        vscode.commands.registerCommand(enum_1.Command.ConfigureScanLimit, () => __awaiter(this, void 0, void 0, function* () {
            let currentScanLimit = yield this.configHelper.getRedisScanLimit();
            const scanLimit = yield vscode.window.showInputBox({
                prompt: enum_1.Message.PromptRedisScanLimit,
                value: currentScanLimit + '',
                placeHolder: enum_1.Message.PlaceholderRedisScanLimit
            });
            if (lodash_1.isNil(scanLimit)) {
                return;
            }
            if (scanLimit === '') {
                vscode.window.showInformationMessage(enum_1.Message.InfoInvalidScanLimit);
                return;
            }
            let scanLimitNo = lodash_1.toNumber(scanLimit);
            if (!lodash_1.isNumber(scanLimitNo) || scanLimitNo < 1) {
                vscode.window.showInformationMessage(enum_1.Message.InfoInvalidScanLimit);
                return;
            }
            yield this.configHelper.saveRedisScanLimit(scanLimitNo);
            this.treeDataProvider.setRedisScanLimit(scanLimitNo);
        }));
        vscode.commands.registerCommand(enum_1.Command.AddRedisConnection, () => __awaiter(this, void 0, void 0, function* () {
            yield this.setupConnectionProfile();
        }));
        vscode.commands.registerCommand(enum_1.Command.EditRedisConnection, (node) => __awaiter(this, void 0, void 0, function* () {
            yield this.setupConnectionProfile(node);
        }));
        vscode.workspace.onDidChangeConfiguration(() => { this.reconnectRedis(); });
        vscode.commands.registerCommand(enum_1.Command.AddRedisKey, (node) => __awaiter(this, void 0, void 0, function* () {
            const key = yield vscode.window.showInputBox({
                prompt: enum_1.Message.PromptNewRedisKey
            });
            if (lodash_1.isNil(key) || key === '') {
                return;
            }
            this.lastAccessedNode = node;
            this.lastAccessedNode.key = key || 'No keyname specified';
            fs_1.writeFile(`${vscode.workspace.rootPath}/${tempOutputFile}`, "", err => {
                if (err) {
                    console.log(err);
                    return;
                }
                vscode.workspace.openTextDocument(`${vscode.workspace.rootPath}/${tempOutputFile}`)
                    .then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            });
        }));
        vscode.commands.registerCommand(enum_1.Command.DeleteRedisKey, (node) => {
            if (node) {
                this.treeDataProvider.deleteRedis(node.key, node.serverName);
                this.treeDataProvider.refresh(node.serverName);
            }
        }, this // To use parameter in callback function, you must pass 'this'
        );
        vscode.commands.registerCommand(enum_1.Command.DeleteRedisConnection, (node) => __awaiter(this, void 0, void 0, function* () {
            const canDelete = yield vscode.window.showWarningMessage(enum_1.Message.WarnProfileDeletion + node.serverName + " ?", { modal: true, }, enum_1.Command.CommandOk);
            if (canDelete === enum_1.Command.CommandOk && node) {
                let success = yield this.configHelper.deleteXplorerConfig(node.serverName);
                if (success) {
                    this.treeDataProvider.refresh(node.serverName);
                }
            }
        }), this // To use parameter in callback function, you must pass 'this'
        );
        vscode.commands.registerCommand(enum_1.Command.DeleteAllKeys, (node) => __awaiter(this, void 0, void 0, function* () {
            //   this.treeDataProvider.refresh();
            const result = yield vscode.window.showWarningMessage(enum_1.Message.WarnDeleteAll, { modal: true }, enum_1.Command.CommandDeleteAll);
            if (result === enum_1.Command.CommandDeleteAll) {
                this.treeDataProvider.flushAll(node.serverName);
                this.treeDataProvider.refresh(node.serverName);
            }
        }));
        vscode.commands.registerCommand(enum_1.Command.RefreshServer, (node) => __awaiter(this, void 0, void 0, function* () {
            this.treeDataProvider.refresh(node.serverName);
        }));
        vscode.commands.registerCommand(enum_1.Command.FilterServerByPattern, (node) => __awaiter(this, void 0, void 0, function* () {
            let filterText = yield vscode.window.showInputBox({
                prompt: enum_1.Message.PromptRedisKeyFilterPattern,
                value: node.filter
            });
            if (!filterText) {
                return;
            }
            filterText = filterText || '*';
            yield this.configHelper.updatefilterText(node.serverName, filterText);
            this.treeDataProvider.refresh(node.serverName);
        }));
        vscode.workspace.onDidSaveTextDocument(event => {
            const extension = event.fileName.split(".");
            if (extension[extension.length - 1] !== "redis") {
                return;
            }
            if (!this.lastAccessedNode.key) {
                return;
            }
            fs_1.readFile(event.fileName, 'utf8', (err, data) => {
                if (err) {
                    console.debug(err.message);
                    return;
                }
                this.treeDataProvider.setRedisValue(this.lastAccessedNode.key, data, this.lastAccessedNode.serverName);
                this.treeDataProvider.refresh(this.lastAccessedNode.serverName);
            });
        });
    }
    reconnectRedis() {
        // this.treeDataProvider.disconnectRedis();
        // this.treeDataProvider.connectRedis();
        // this.lastResource = undefined;
    }
    setupConnectionProfile(node) {
        return __awaiter(this, void 0, void 0, function* () {
            let isEdit = !lodash_1.isNil(node);
            let xconfigProfile;
            let oldProfileName = '';
            if (isEdit) {
                console.log('Edit flow started');
                xconfigProfile = yield this.configHelper.getProfileByName(node.serverName);
                if (!xconfigProfile) {
                    return;
                }
            }
            let inputOptions = {
                ignoreFocusOut: true,
                prompt: enum_1.Message.PromptDisplayName,
                placeHolder: enum_1.Message.PlaceholderDisplayName,
            };
            if (isEdit) {
                oldProfileName = xconfigProfile.name;
                inputOptions.value = xconfigProfile.name;
                inputOptions.valueSelection = undefined;
            }
            let profileName = yield vscode.window.showInputBox(inputOptions);
            if (lodash_1.isUndefined(profileName)) {
                return;
            }
            if (lodash_1.trim(profileName) === '') {
                vscode.window.showInformationMessage(enum_1.Message.InfoDisplayName);
                return;
            }
            inputOptions.prompt = enum_1.Message.PromptHostserver;
            inputOptions.placeHolder = enum_1.Message.PlaceholderHostserver;
            if (isEdit) {
                inputOptions.value = xconfigProfile.host;
                inputOptions.valueSelection = undefined;
            }
            let hostName = yield vscode.window.showInputBox(inputOptions);
            if (lodash_1.isNil(hostName) || lodash_1.trim(hostName) === "") {
                vscode.window.showInformationMessage(enum_1.Message.InfoHostServer);
                return;
            }
            inputOptions.prompt = enum_1.Message.PromptPortNumber;
            inputOptions.value = enum_1.Constants.RedisDefaultPortNo;
            inputOptions.placeHolder = enum_1.Message.PlaceholderPortNumber;
            if (isEdit) {
                if (xconfigProfile.port) {
                    inputOptions.value = xconfigProfile.port.toString();
                }
                inputOptions.valueSelection = undefined;
            }
            let portNumber = yield vscode.window.showInputBox(inputOptions);
            if (lodash_1.isNil(portNumber) || lodash_1.trim(portNumber) === "") {
                vscode.window.showInformationMessage(enum_1.Message.InfoPortNumber);
                return;
            }
            else {
                let port = lodash_1.toNumber(portNumber);
                if (!lodash_1.isNumber(port)) {
                    vscode.window.showInformationMessage(enum_1.Message.InfoInvalidPortNumber);
                    return;
                }
            }
            inputOptions.value = undefined;
            inputOptions.prompt = enum_1.Message.PromptPassword;
            inputOptions.placeHolder = enum_1.Message.PlaceholderPassword;
            if (isEdit) {
                inputOptions.value = xconfigProfile.accessKey;
                inputOptions.valueSelection = undefined;
            }
            let password = yield vscode.window.showInputBox(inputOptions);
            if (lodash_1.isNil(password)) {
                vscode.window.showInformationMessage(enum_1.Message.InfoProfileNotSaved);
                return;
            }
            password = lodash_1.trim(password);
            this.configHelper.addOrUpdateConfig(profileName, hostName, portNumber, password, oldProfileName).then(() => this.treeDataProvider.refresh(profileName));
        });
    }
    openResource(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            let vsCodeProgressOptions = {
                location: vscode.ProgressLocation.Notification,
                cancellable: false,
                title: enum_1.Message.TitleRedisXplorer
            };
            vscode.window.withProgress(vsCodeProgressOptions, (progress) => {
                progress.report({ message: enum_1.Message.ProgressInitiate, increment: 0 });
                return new Promise(resolve => {
                    if (!resource) {
                        this.writeToEditorCallback(enum_1.Message.InfoNoData, progress, resolve);
                    }
                    else if (resource.value === '#server#') {
                        progress.report({ message: enum_1.Message.ProgressConnectionInfo, increment: 30 });
                        this.treeDataProvider.getServerNodeInfo(resource.serverName).then(result => this.writeToEditorCallback(result, progress, resolve));
                    }
                    else {
                        progress.report({ message: enum_1.Message.ProgressGetValueFor + '`' + resource.value + '`', increment: 30 });
                        this.treeDataProvider.getNodeValue(resource.key, resource.serverName).then(result => this.writeToEditorCallback(result, progress, resolve));
                    }
                });
            });
        });
    }
    writeToEditorCallback(result, progress, resolve) {
        progress.report({ message: enum_1.Message.ProgressWriteToFile, increment: 80 });
        fs_1.writeFile(`${vscode.workspace.rootPath}/${tempOutputFile}`, result, err => {
            if (err) {
                console.log(err);
                return;
            }
            vscode.workspace
                .openTextDocument(`${vscode.workspace.rootPath}/${tempOutputFile}`)
                .then(doc => {
                vscode.window.showTextDocument(doc);
            });
        });
        progress.report({ message: enum_1.Message.ProgressDone, increment: 100 });
        setTimeout(() => {
            resolve();
        }, 1000);
    }
}
exports.RedisXplorer = RedisXplorer;
//# sourceMappingURL=RedisExplorer.js.map