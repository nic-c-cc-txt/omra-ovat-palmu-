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
const fs = require("fs-extra");
const path = require("path");
const jsonc = require("jsonc-parser");
const os = require("os");
const configEnvCommand = 'psl.configureEnvironment';
const LOCAL_ENV_DIR = path.join('.vscode', 'environment.json');
const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 900);
statusBar.command = configEnvCommand;
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand(configEnvCommand, configureEnvironmentHandler));
    context.subscriptions.push(statusBar);
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((e) => changeTextEditorHandler(e)));
    changeTextEditorHandler(vscode.window.activeTextEditor);
}
exports.activate = activate;
function workspaceQuickPick() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield GlobalFile.read();
        }
        catch (e) {
            let defaultConfig = { environments: [{ name: '', host: '', port: 0, user: '', password: '', sshLogin: '', serverType: 'SCA$IBS', encoding: 'utf8' }] };
            yield GlobalFile.write(defaultConfig);
            yield GlobalFile.show();
            return;
        }
        if (!vscode.workspace.workspaceFolders)
            return;
        let workspaceFolders = vscode.workspace.workspaceFolders;
        let items = yield Promise.all(workspaceFolders.map((folder) => __awaiter(this, void 0, void 0, function* () {
            let name;
            try {
                let envObjects = yield new WorkspaceFile(folder.uri.fsPath).environmentObjects;
                if (envObjects.length === 1) {
                    name = '\u00a0 \u00a0 $(server) ' + envObjects[0].name;
                }
                else if (envObjects.length > 1) {
                    name = '\u00a0 \u00a0 $(server) ' + envObjects.map(e => e.name).join(', ');
                }
                else {
                    name = '\u00a0 \u00a0 Not configured';
                }
            }
            catch (e) {
                name = '\u00a0 \u00a0 Not configured';
            }
            let item = { label: '$(file-directory) ' + folder.name, description: folder.uri.fsPath, detail: name, fsPath: folder.uri.fsPath };
            return item;
        })));
        if (items.length === 1)
            return items[0];
        let configureEnvironments = '\u270E Edit Environments...';
        items.push({ label: configureEnvironments, description: '', fsPath: '' });
        let choice = yield vscode.window.showQuickPick(items, { placeHolder: 'Select a Workspace.' });
        if (!choice)
            return;
        if (choice.label === configureEnvironments) {
            yield GlobalFile.show();
            return;
        }
        return choice;
    });
}
exports.workspaceQuickPick = workspaceQuickPick;
function configureEnvironmentHandler() {
    return __awaiter(this, void 0, void 0, function* () {
        let workspace = yield workspaceQuickPick();
        if (!workspace)
            return;
        environmentQuickPick(new WorkspaceFile(workspace.fsPath));
    });
}
function environmentQuickPick(workspaceFile) {
    return __awaiter(this, void 0, void 0, function* () {
        let choice = undefined;
        let workspaceEnvironments;
        let globalConfig;
        let names;
        try {
            globalConfig = yield GlobalFile.read();
        }
        catch (e) {
            if (e === GlobalFile.INVALID_CONFIG) {
                yield GlobalFile.show();
            }
            else {
            }
            let defaultConfig = { environments: [{ name: '', host: '', port: 0, user: '', password: '', sshLogin: '' }] };
            yield GlobalFile.write(defaultConfig);
            yield GlobalFile.show();
            return;
        }
        try {
            workspaceEnvironments = yield workspaceFile.environment;
            names = workspaceEnvironments.names;
        }
        catch (e) {
            yield workspaceFile.writeLocalEnv({ 'names': [] });
            workspaceEnvironments = yield workspaceFile.environment;
            names = workspaceEnvironments.names;
        }
        do {
            let items = globalConfig.environments.map(env => {
                if (names.indexOf(env.name) > -1) {
                    return { label: `${env.name}`, description: '✔' };
                }
                return { label: `${env.name}`, description: '' };
            });
            let configureEnvironments = '\u270E Edit Environments...';
            let back = '\u21a9 Back to Workspaces';
            items.push({ label: configureEnvironments, description: '' });
            if (vscode.workspace.workspaceFolders.length > 1) {
                items.push({ label: back, description: '' });
            }
            choice = yield vscode.window.showQuickPick(items, { placeHolder: `Enable environments for ${workspaceFile.workspaceFolder.name}` });
            if (choice) {
                if (choice.label === configureEnvironments) {
                    GlobalFile.show();
                    break;
                }
                if (choice.label === back) {
                    configureEnvironmentHandler();
                    break;
                }
                let index = names.indexOf(choice.label);
                if (index > -1) {
                    names.splice(index, 1);
                }
                else
                    names.push(choice.label);
                workspaceFile.writeLocalEnv(workspaceEnvironments);
            }
        } while (choice);
        yield changeTextEditorHandler(vscode.window.activeTextEditor);
    });
}
function changeTextEditorHandler(textEditor) {
    return __awaiter(this, void 0, void 0, function* () {
        let configureEnvironmentText = '$(server) Configure Environments';
        try {
            let workspaceFile = new WorkspaceFile(textEditor.document.fileName);
            let workspaceEnvironments = yield workspaceFile.environment;
            if (workspaceEnvironments.names.length === 0) {
                statusBar.text = configureEnvironmentText;
            }
            else if (workspaceEnvironments.names.length === 1) {
                statusBar.text = '$(server) ' + workspaceEnvironments.names[0];
            }
            else {
                statusBar.text = '$(server) ' + workspaceEnvironments.names.length + ' environments';
            }
        }
        catch (e) {
            statusBar.text = configureEnvironmentText;
        }
        statusBar.show();
    });
}
class WorkspaceFile {
    /**
     * @param {string} fsPath The file system path of the file.
     */
    constructor(fsPath) {
        /**
         * The file system path of the file.
         */
        this.workspaceFolder = undefined;
        /**
         * Contents of local environment.json
         */
        this._enviornment = undefined;
        /**
         * Environment configurations from global environments.json
         * corresponding to names in local environment.json
         */
        this._environmentObjects = undefined;
        this.fsPath = fsPath;
        if (!fsPath) {
            this.environmentPath = '';
            return;
        }
        this.workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fsPath));
        if (!this.workspaceFolder) {
            this.environmentPath = '';
        }
        else {
            this.environmentPath = path.join(this.workspaceFolder.uri.fsPath, LOCAL_ENV_DIR);
        }
    }
    /**
     * Environment configurations from global environments.json
     * corresponding to names in local environment.json
     */
    get environmentObjects() {
        if (this._environmentObjects)
            return Promise.resolve(this._environmentObjects);
        return this.getEnvironmentObjects();
    }
    getEnvironmentObjects() {
        return __awaiter(this, void 0, void 0, function* () {
            let environment = yield this.environment;
            let globalEnv = yield this.getEnvironmentFromGlobalConfig(environment.names);
            this._environmentObjects = globalEnv;
            return this._environmentObjects;
        });
    }
    /**
     *
     * @param nameArray An array of names to match the names of configurations in the GlobalConfig.
     */
    getEnvironmentFromGlobalConfig(nameArray) {
        return __awaiter(this, void 0, void 0, function* () {
            let allEnvs = (yield GlobalFile.read()).environments;
            let ret = [];
            for (let name of nameArray) {
                for (let env of allEnvs) {
                    if (env.name === name) {
                        ret.push(env);
                    }
                }
            }
            return ret;
        });
    }
    /**
     * Contents of local environment.json
     */
    get environment() {
        if (this._enviornment)
            return Promise.resolve(this._enviornment);
        return fs.readFile(this.environmentPath).then((file) => __awaiter(this, void 0, void 0, function* () {
            let localEnvironment = jsonc.parse(file.toString());
            if (!localEnvironment.names || !Array.isArray(localEnvironment.names)) {
                throw new Error('Local environment.json is not properly configured.');
            }
            this._enviornment = localEnvironment;
            return localEnvironment;
        }));
    }
    writeLocalEnv(newLocalEnv) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO prune names
            yield fs.ensureFile(this.environmentPath);
            yield fs.writeFile(this.environmentPath, JSON.stringify(newLocalEnv, null, '\t'));
        });
    }
}
exports.WorkspaceFile = WorkspaceFile;
class GlobalFile {
    /**
     * Reads and returns the contents of the file.
     *
     * @throws An error if parsing fails or if improperly formatted.
     */
    static read() {
        return __awaiter(this, void 0, void 0, function* () {
            let globalConfig = jsonc.parse((yield fs.readFile(this.path)).toString());
            if (!globalConfig.environments)
                throw this.INVALID_CONFIG;
            return globalConfig;
        });
    }
    /**
     * Writes the new configuration to the file.
     *
     * @param newGlobalConfig The new configuration.
     */
    static write(newGlobalConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.ensureFile(this.path);
            yield fs.writeFile(this.path, JSON.stringify(newGlobalConfig, null, '\t'));
        });
    }
    /**
     * Shows the configuration file in the editor window.
     */
    static show() {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.window.showTextDocument(vscode.Uri.file(this.path));
        });
    }
}
exports.GlobalFile = GlobalFile;
/**
 * Path to the global config file
 */
GlobalFile.path = (() => {
    const envFileName = 'environments.json';
    const appdata = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : '/var/local');
    let channelPath;
    if (vscode.env.appName.indexOf('Insiders') > 0) {
        channelPath = 'Code - Insiders';
    }
    else {
        channelPath = 'Code';
    }
    let envPath = path.join(appdata, channelPath, 'User', envFileName);
    // in linux, it may not work with /var/local, then try to use /home/myuser/.config
    if ((process.platform === 'linux') && (!fs.existsSync(envPath))) {
        envPath = path.join(os.homedir(), '.config/', channelPath, 'User', envFileName);
    }
    return envPath;
})();
GlobalFile.INVALID_CONFIG = new Error('Missing environments in global config.');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2Vudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLCtCQUErQjtBQUMvQiw2QkFBNkI7QUFDN0Isc0NBQXNDO0FBQ3RDLHlCQUF5QjtBQUV6QixNQUFNLGdCQUFnQixHQUFHLDBCQUEwQixDQUFDO0FBRXBELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFFL0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzFGLFNBQVMsQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUM7QUFFckMsU0FBZ0IsUUFBUSxDQUFDLE9BQWdDO0lBRXhELE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUN6QixNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FDOUIsZ0JBQWdCLEVBQUUsMkJBQTJCLENBQzdDLENBQ0QsQ0FBQztJQUVGLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXRDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6Ryx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUE7QUFFeEQsQ0FBQztBQWJELDRCQWFDO0FBeUJELFNBQXNCLGtCQUFrQjs7UUFDdkMsSUFBSTtZQUNILE1BQU0sVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3hC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