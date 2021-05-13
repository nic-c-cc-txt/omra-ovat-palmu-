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
const utils = require("./hostCommandUtils");
const path = require("path");
const fs = require("fs-extra");
const environment = require("../common/environment");
const mumps_1 = require("../language/mumps");
const icon = "\u21E9" /* GET */;
function getElementHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let c = utils.getFullContext(context);
        if (c.mode === 2 /* DIRECTORY */) {
            let input = yield promptUserForComponent();
            if (input)
                return getElement(path.join(c.fsPath, input)).catch(() => { });
        }
        else if (c.mode === 1 /* FILE */) {
            let workspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(c.fsPath));
            if (!workspace) {
                // skeptical of this approach
                return;
            }
            let input = yield promptUserForComponent();
            if (!input)
                return;
            let extension = path.extname(input).replace('.', '');
            let description = utils.extensionToDescription[extension];
            let filters = {};
            filters[description] = [extension];
            let currentFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(c.fsPath));
            if (!currentFolder)
                return;
            let target;
            let defaultDir = DIR_MAPPINGS[extension];
            if (defaultDir) {
                target = { fsPath: path.join(currentFolder.uri.fsPath, defaultDir, input) };
            }
            else {
                let defaultUri = vscode.Uri.file(path.join(currentFolder.uri.fsPath, input));
                target = yield vscode.window.showSaveDialog({ defaultUri, filters: filters });
            }
            if (!target)
                return;
            return getElement(target.fsPath).catch(() => { });
        }
        else {
            let quickPick = yield environment.workspaceQuickPick();
            if (!quickPick)
                return;
            let chosenEnv = quickPick;
            let input = yield promptUserForComponent();
            if (!input)
                return;
            let extension = path.extname(input).replace('.', '');
            let description = utils.extensionToDescription[extension];
            let filters = {};
            filters[description] = [extension];
            let target;
            let defaultDir = DIR_MAPPINGS[extension];
            if (defaultDir) {
                target = { fsPath: path.join(chosenEnv.fsPath, defaultDir, input) };
            }
            else {
                let defaultUri = vscode.Uri.file(path.join(chosenEnv.fsPath, input));
                target = yield vscode.window.showSaveDialog({ defaultUri, filters: filters });
            }
            if (!target)
                return;
            return getElement(target.fsPath).catch(() => { });
        }
        return;
    });
}
exports.getElementHandler = getElementHandler;
function getTableHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let c = utils.getFullContext(context);
        if (c.mode === 2 /* DIRECTORY */) {
            let input = yield promptUserForTable();
            if (input)
                return getTable(input, c.fsPath, c.fsPath).catch(() => { });
        }
        else if (c.mode === 1 /* FILE */) {
            let workspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(c.fsPath));
            if (!workspace) {
                // skeptical of this approach
                return;
            }
            let tableName = yield promptUserForTable();
            if (!tableName)
                return;
            let tableDir = DIR_MAPPINGS['TABLE'];
            let target;
            if (tableDir) {
                target = [{ fsPath: path.join(workspace.uri.fsPath, tableDir) }];
            }
            else {
                target = yield vscode.window.showOpenDialog({ defaultUri: workspace.uri, canSelectFiles: false, canSelectFolders: true, canSelectMany: false, filters: { 'Table Directory': [] } });
            }
            if (!target)
                return;
            return getTable(tableName, target[0].fsPath, workspace.uri.fsPath).catch(() => { });
        }
        else {
            let quickPick = yield environment.workspaceQuickPick();
            if (!quickPick)
                return;
            let chosenEnv = quickPick;
            let tableName = yield promptUserForTable();
            if (!tableName)
                return;
            let tableDir = DIR_MAPPINGS['TABLE'];
            let target;
            if (tableDir) {
                target = [{ fsPath: path.join(chosenEnv.description, tableDir) }];
            }
            else {
                target = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(chosenEnv.description), canSelectFiles: false, canSelectFolders: true, canSelectMany: false, filters: { 'Table Directory': [] } });
            }
            if (!target)
                return;
            return getTable(tableName, target[0].fsPath, chosenEnv.description).catch(() => { });
        }
        return;
    });
}
exports.getTableHandler = getTableHandler;
function getCompiledCodeHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let c = utils.getFullContext(context);
        if (c.mode === 1 /* FILE */) {
            return getCompiledCode(c.fsPath).catch(() => { });
        }
        else if (c.mode === 2 /* DIRECTORY */) {
            let files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(c.fsPath), canSelectMany: true, openLabel: 'Refresh' });
            if (!files)
                return;
            for (let fsPath of files.map(file => file.fsPath)) {
                yield getCompiledCode(fsPath).catch(() => { });
            }
        }
        else {
            let quickPick = yield environment.workspaceQuickPick();
            if (!quickPick)
                return;
            let chosenEnv = quickPick;
            let files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(chosenEnv.fsPath), canSelectMany: true, openLabel: 'Refresh' });
            if (!files)
                return;
            for (let fsPath of files.map(file => file.fsPath)) {
                yield getCompiledCode(fsPath).catch(() => { });
            }
        }
        return;
    });
}
exports.getCompiledCodeHandler = getCompiledCodeHandler;
function getCompiledCode(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.statSync(fsPath).isFile())
            return;
        let env;
        const routineName = `${path.basename(fsPath).split('.')[0]}.m`;
        return utils.executeWithProgress(`${icon} ${path.basename(fsPath)} GET`, () => __awaiter(this, void 0, void 0, function* () {
            let envs;
            try {
                envs = yield utils.getEnvironment(fsPath);
            }
            catch (e) {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} Invalid environment configuration.`);
                return;
            }
            if (envs.length === 0) {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} No environments selected.`);
                return;
            }
            let choice = yield utils.getCommandenvConfigQuickPick(envs);
            if (!choice)
                return;
            env = choice;
            utils.logger.info(`${"\u2026" /* WAIT */} ${icon} ${routineName} GET COMPILED from ${env.name}`);
            let doc = yield vscode.workspace.openTextDocument(fsPath);
            yield doc.save();
            let connection = yield utils.getConnection(env);
            let output = yield connection.get(routineName);
            const uri = vscode.Uri.parse(`${mumps_1.MumpsVirtualDocument.schemes.compiled}:/${env.name}/${routineName}`);
            const virtualDocument = new mumps_1.MumpsVirtualDocument(routineName, output, uri);
            utils.logger.info(`${"\u2714" /* SUCCESS */} ${icon} ${routineName} GET COMPILED from ${env.name} succeeded`);
            connection.close();
            vscode.window.showTextDocument(virtualDocument.uri, { preview: false });
        })).catch((e) => {
            if (env && env.name) {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} error in ${env.name} ${e.message}`);
            }
            else {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} ${e.message}`);
            }
        });
    });
}
function getElement(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let env;
        yield utils.executeWithProgress(`${icon} ${path.basename(fsPath)} GET`, () => __awaiter(this, void 0, void 0, function* () {
            let envs;
            try {
                envs = yield utils.getEnvironment(fsPath);
            }
            catch (e) {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} Invalid environment configuration.`);
                return;
            }
            if (envs.length === 0) {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} No environments selected.`);
                return;
            }
            let choice = yield utils.getCommandenvConfigQuickPick(envs);
            if (!choice)
                return;
            env = choice;
            utils.logger.info(`${"\u2026" /* WAIT */} ${icon} ${path.basename(fsPath)} GET from ${env.name}`);
            let connection = yield utils.getConnection(env);
            let output = yield connection.get(fsPath);
            yield fs.ensureDir(path.dirname(fsPath));
            yield utils.writeFileWithSettings(fsPath, output);
            utils.logger.info(`${"\u2714" /* SUCCESS */} ${icon} ${path.basename(fsPath)} GET from ${env.name} succeeded`);
            connection.close();
            yield vscode.workspace.openTextDocument(fsPath).then(vscode.window.showTextDocument);
        })).catch((e) => {
            if (env && env.name) {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} error in ${env.name} ${e.message}`);
            }
            else {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} ${e.message}`);
            }
        });
        return;
    });
}
function getTable(tableName, targetDirectory, workpacePath) {
    return __awaiter(this, void 0, void 0, function* () {
        let env;
        yield utils.executeWithProgress(`${icon} ${tableName} TABLE GET`, () => __awaiter(this, void 0, void 0, function* () {
            let envs;
            try {
                envs = yield utils.getEnvironment(workpacePath);
            }
            catch (e) {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} Invalid environment configuration.`);
                return;
            }
            if (envs.length === 0) {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} No environments selected.`);
                return;
            }
            let choice = yield utils.getCommandenvConfigQuickPick(envs);
            if (!choice)
                return;
            env = choice;
            utils.logger.info(`${"\u2026" /* WAIT */} ${icon} ${tableName} TABLE GET from ${env.name}`);
            let connection = yield utils.getConnection(env);
            let output = yield connection.getTable(tableName.toUpperCase() + '.TBL');
            yield fs.ensureDir(path.join(targetDirectory, tableName.toLowerCase()));
            let tableFiles = (yield fs.readdir(targetDirectory)).filter(f => f.startsWith(tableName));
            for (let file of tableFiles) {
                yield fs.remove(file);
            }
            const promises = output.split(String.fromCharCode(0)).map(content => {
                const contentArray = content.split(String.fromCharCode(1));
                const fileName = contentArray[0];
                const fileContent = contentArray[1];
                return utils.writeFileWithSettings(path.join(targetDirectory, tableName.toLowerCase(), fileName), fileContent);
            });
            yield Promise.all(promises);
            utils.logger.info(`${"\u2714" /* SUCCESS */} ${icon} ${tableName} TABLE GET from ${env.name} succeeded`);
            connection.close();
        })).catch((e) => {
            if (env && env.name) {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} error in ${env.name} ${e.message}`);
            }
            else {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} ${e.message}`);
            }
        });
        return;
    });
}
function promptUserForComponent() {
    return __awaiter(this, void 0, void 0, function* () {
        let inputOptions = {
            prompt: 'Name of Component (with extension)', validateInput: (input) => {
                if (!input)
                    return;
                let extension = path.extname(input) ? path.extname(input).replace('.', '') : 'No extension';
                if (extension in utils.extensionToDescription)
                    return '';
                return `Invalid extension (${extension})`;
            }
        };
        return vscode.window.showInputBox(inputOptions);
    });
}
function promptUserForTable() {
    return __awaiter(this, void 0, void 0, function* () {
        let inputOptions = {
            prompt: 'Name of Table (no extension)',
            validateInput: (value) => {
                if (!value)
                    return;
                if (value.includes('.'))
                    return 'Do not include the extension';
            }
        };
        return vscode.window.showInputBox(inputOptions);
    });
}
const DIR_MAPPINGS = {
    'BATCH': 'dataqwik/batch',
    'COL': '',
    'DAT': 'data',
    'FKY': 'dataqwik/foreign_key',
    // 'G': 'Global',
    'IDX': 'dataqwik/index',
    'JFD': 'dataqwik/journal',
    'm': 'routine',
    'PPL': '',
    'PROC': 'dataqwik/procedure',
    'properties': 'property',
    'PSL': '',
    'psl': '',
    'pslx': '',
    'pslxtra': '',
    'psql': '',
    'QRY': 'dataqwik/query',
    'RPT': 'dataqwik/report',
    'SCR': 'dataqwik/screen',
    // TABLE not supported
    'TABLE': 'dataqwik/table',
    'TBL': '',
    'TRIG': 'dataqwik/trigger',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hvc3RDb21tYW5kcy9nZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBaUM7QUFDakMsNENBQTRDO0FBQzVDLDZCQUE2QjtBQUM3QiwrQkFBK0I7QUFDL0IscURBQXFEO0FBQ3JELDZDQUF5RDtBQUV6RCxNQUFNLElBQUkscUJBQWtCLENBQUM7QUFFN0IsU0FBc0IsaUJBQWlCLENBQUMsT0FBc0M7O1FBQzdFLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLENBQUMsSUFBSSxzQkFBZ0MsRUFBRTtZQUMzQyxJQUFJLEtBQUssR0FBRyxNQUFNLHNCQUFzQixFQUFFLENBQUM7WUFDM0MsSUFBSSxLQUFLO2dCQUFFLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUMxRTthQUNJLElBQUksQ0FBQyxDQUFDLElBQUksaUJBQTJCLEVBQUU7WUFDM0MsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNmLDZCQUE2QjtnQkFDN0IsT0FBTzthQUNQO1lBQ0QsSUFBSSxLQUFLLEdBQUcsTUFBTSxzQkFBc0IsRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxLQUFLO2dCQUFFLE9BQU87WUFDbkIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUN6RCxJQUFJLE9BQU8sR0FBaUMsRUFBRSxDQUFBO1lBQzlDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ2xDLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFDbEYsSUFBSSxDQUFDLGFBQWE7Z0JBQUUsT0FBTztZQUMzQixJQUFJLE1BQU0sQ0FBQTtZQUNWLElBQUksVUFBVSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6QyxJQUFJLFVBQVUsRUFBRTtnQkFDZixNQUFNLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQTthQUMzRTtpQkFDSTtnQkFDSixJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7Z0JBQzVFLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQzlFO1lBQ0QsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTztZQUNwQixPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2xEO2FBQ0k7WUFDSixJQUFJLFNBQVMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU87WUFDdkIsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzFCLElBQUksS0FBSyxHQUFHLE1BQU0sc0JBQXNCLEVBQUUsQ0FBQztZQUMzQyxJQUFJLENBQUMsS0FBSztnQkFBRSxPQUFPO1lBQ25CLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyRCxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDekQsSUFBSSxPQUFPLEdBQWlDLEVBQUUsQ0FBQTtZQUM5QyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUNsQyxJQUFJLE1BQU0sQ0FBQTtZQUNWLElBQUksVUFBVSxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6QyxJQUFJLFVBQVUsRUFBRTtnQkFDZixNQUFNLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFBO2FBQ25FO2lCQUNJO2dCQUNKLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO2dCQUNwRSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUM5RTtZQUNELElBQUksQ0FBQyxNQUFNO2dCQUFFLE9BQU87WUFDcEIsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNsRDtRQUNELE9BQU87SUFDUixDQUFDO0NBQUE7QUF2REQsOENBdURDO0FBRUQsU0FBc0IsZUFBZSxDQUFDLE9BQXNDOztRQUMzRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxDQUFDLElBQUksc0JBQWdDLEVBQUU7WUFDM0MsSUFBSSxLQUFLLEdBQUcsTUFBTSxrQkFBa0IsRUFBRSxDQUFDO1lBQ3ZDLElBQUksS0FBSztnQkFBRSxPQUFPLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3ZFO2FBQ0ksSUFBSSxDQUFDLENBQUMsSUFBSSxpQkFBMkIsRUFBRTtZQUMzQyxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQy9FLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2YsNkJBQTZCO2dCQUM3QixPQUFPO2FBQ1A7WUFDRCxJQUFJLFNBQVMsR0FBRyxNQUFNLGtCQUFrQixFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLFNBQVM7Z0JBQUUsT0FBTztZQUN2QixJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDcEMsSUFBSSxNQUFNLENBQUM7WUFDWCxJQUFJLFFBQVEsRUFBRTtnQkFDYixNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTthQUNoRTtpQkFDSTtnQkFDSixNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3BMO1lBQ0QsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTztZQUNwQixPQUFPLFFBQVEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNwRjthQUNJO1lBQ0osSUFBSSxTQUFTLEdBQUcsTUFBTSxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUN2RCxJQUFJLENBQUMsU0FBUztnQkFBRSxPQUFPO1lBQ3ZCLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMxQixJQUFJLFNBQVMsR0FBRyxNQUFNLGtCQUFrQixFQUFFLENBQUM7WUFDM0MsSUFBSSxDQUFDLFNBQVM7Z0JBQUUsT0FBTztZQUN2QixJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDcEMsSUFBSSxNQUFNLENBQUM7WUFDWCxJQUFJLFFBQVEsRUFBRTtnQkFDYixNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFBO2FBQ2pFO2lCQUNJO2dCQUNKLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLGlCQUFpQixFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUM3TTtZQUNELElBQUksQ0FBQyxNQUFNO2dCQUFFLE9BQU87WUFDcEIsT0FBTyxRQUFRLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNyRjtRQUNELE9BQU87SUFDUixDQUFDO0NBQUE7QUEzQ0QsMENBMkNDO0FBRUQsU0FBc0Isc0JBQXNCLENBQUMsT0FBc0M7O1FBQ2xGLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLENBQUMsSUFBSSxpQkFBMkIsRUFBRTtZQUN0QyxPQUFPLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2pEO2FBQ0ksSUFBSSxDQUFDLENBQUMsSUFBSSxzQkFBZ0MsRUFBRTtZQUNoRCxJQUFJLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFBO1lBQ2xJLElBQUksQ0FBQyxLQUFLO2dCQUFFLE9BQU87WUFDbkIsS0FBSyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNsRCxNQUFNLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7YUFDOUM7U0FDRDthQUNJO1lBQ0osSUFBSSxTQUFTLEdBQUcsTUFBTSxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUN2RCxJQUFJLENBQUMsU0FBUztnQkFBRSxPQUFPO1lBQ3ZCLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMxQixJQUFJLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFBO1lBQzFJLElBQUksQ0FBQyxLQUFLO2dCQUFFLE9BQU87WUFDbkIsS0FBSyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNsRCxNQUFNLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUE7YUFDN0M7U0FDRDtRQUNELE9BQU87SUFDUixDQUFDO0NBQUE7QUF2QkQsd0RBdUJDO0FBRUQsU0FBZSxlQUFlLENBQUMsTUFBYzs7UUFDNUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQUUsT0FBTztRQUMxQyxJQUFJLEdBQWtDLENBQUM7UUFDdkMsTUFBTSxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQy9ELE9BQU8sS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFTLEVBQUU7WUFDbkYsSUFBSSxJQUFJLENBQUM7WUFDVCxJQUFJO2dCQUNILElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDMUM7WUFDRCxPQUFPLENBQUMsRUFBRTtnQkFDVCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLG9CQUFpQixJQUFJLElBQUkscUNBQXFDLENBQUMsQ0FBQztnQkFDdEYsT0FBTzthQUNQO1lBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBaUIsSUFBSSxJQUFJLDRCQUE0QixDQUFDLENBQUM7Z0JBQzdFLE9BQU87YUFDUDtZQUNELElBQUksTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxNQUFNO2dCQUFFLE9BQU87WUFDcEIsR0FBRyxHQUFHLE1BQU0sQ0FBQztZQUNiLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsbUJBQWdCLElBQUksSUFBSSxJQUFJLFdBQVcsc0JBQXNCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzlGLElBQUksR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxRCxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNqQixJQUFJLFVBQVUsR0FBRyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEQsSUFBSSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsNEJBQW9CLENBQUMsT0FBTyxDQUFDLFFBQVEsS0FBSyxHQUFHLENBQUMsSUFBSSxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDckcsTUFBTSxlQUFlLEdBQUcsSUFBSSw0QkFBb0IsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzNFLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsc0JBQW1CLElBQUksSUFBSSxJQUFJLFdBQVcsc0JBQXNCLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxDQUFDO1lBQzNHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuQixNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUN2RSxDQUFDLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQVEsRUFBRSxFQUFFO1lBQ3JCLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3BCLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsb0JBQWlCLElBQUksSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDckY7aUJBQ0k7Z0JBQ0osS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBaUIsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDaEU7UUFDRixDQUFDLENBQUMsQ0FBQTtJQUNILENBQUM7Q0FBQTtBQUVELFNBQWUsVUFBVSxDQUFDLE1BQWM7O1FBQ3ZDLElBQUksR0FBRyxDQUFDO1FBQ1IsTUFBTSxLQUFLLENBQUMsbUJBQW1CLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQVMsRUFBRTtZQUNsRixJQUFJLElBQUksQ0FBQztZQUNULElBQUk7Z0JBQ0gsSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUMxQztZQUNELE9BQU8sQ0FBQyxFQUFFO2dCQUNULEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsb0JBQWlCLElBQUksSUFBSSxxQ0FBcUMsQ0FBQyxDQUFDO2dCQUN0RixPQUFPO2FBQ1A7WUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN0QixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLG9CQUFpQixJQUFJLElBQUksNEJBQTRCLENBQUMsQ0FBQztnQkFDN0UsT0FBTzthQUNQO1lBQ0QsSUFBSSxNQUFNLEdBQUcsTUFBTSxLQUFLLENBQUMsNEJBQTRCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUQsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTztZQUNwQixHQUFHLEdBQUcsTUFBTSxDQUFDO1lBQ2IsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBZ0IsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMvRixJQUFJLFVBQVUsR0FBRyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEQsSUFBSSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFDeEMsTUFBTSxLQUFLLENBQUMscUJBQXFCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2xELEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsc0JBQW1CLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGFBQWEsR0FBRyxDQUFDLElBQUksWUFBWSxDQUFDLENBQUM7WUFDNUcsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25CLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBQ3JGLENBQUMsQ0FBQSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBUSxFQUFFLEVBQUU7WUFDckIsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksRUFBRTtnQkFDcEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBaUIsSUFBSSxJQUFJLGFBQWEsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUNyRjtpQkFDSTtnQkFDSixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLG9CQUFpQixJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQzthQUNoRTtRQUNGLENBQUMsQ0FBQyxDQUFBO1FBQ0YsT0FBTztJQUNSLENBQUM7Q0FBQTtBQUVELFNBQWUsUUFBUSxDQUFDLFNBQWlCLEVBQUUsZUFBdUIsRUFBRSxZQUFvQjs7UUFDdkYsSUFBSSxHQUFHLENBQUM7UUFDUixNQUFNLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLElBQUksSUFBSSxTQUFTLFlBQVksRUFBRSxHQUFTLEVBQUU7WUFDNUUsSUFBSSxJQUFJLENBQUM7WUFDVCxJQUFJO2dCQUNILElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDaEQ7WUFDRCxPQUFPLENBQUMsRUFBRTtnQkFDVCxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLG9CQUFpQixJQUFJLElBQUkscUNBQXFDLENBQUMsQ0FBQztnQkFDdEYsT0FBTzthQUNQO1lBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBaUIsSUFBSSxJQUFJLDRCQUE0QixDQUFDLENBQUM7Z0JBQzdFLE9BQU87YUFDUDtZQUNELElBQUksTUFBTSxHQUFHLE1BQU0sS0FBSyxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxNQUFNO2dCQUFFLE9BQU87WUFDcEIsR0FBRyxHQUFHLE1BQU0sQ0FBQztZQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsbUJBQWdCLElBQUksSUFBSSxJQUFJLFNBQVMsbUJBQW1CLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZHLElBQUksVUFBVSxHQUFHLE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNoRCxJQUFJLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ3pFLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLElBQUksVUFBVSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzFGLEtBQUssSUFBSSxJQUFJLElBQUksVUFBVSxFQUFFO2dCQUM1QixNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdEI7WUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25FLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsT0FBTyxLQUFLLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLFdBQVcsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ2hILENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVCLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsc0JBQW1CLElBQUksSUFBSSxJQUFJLFNBQVMsbUJBQW1CLEdBQUcsQ0FBQyxJQUFJLFlBQVksQ0FBQyxDQUFDO1lBQ3RHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQixDQUFDLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQVEsRUFBRSxFQUFFO1lBQ3JCLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3BCLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsb0JBQWlCLElBQUksSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDckY7aUJBQ0k7Z0JBQ0osS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBaUIsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDaEU7UUFDRixDQUFDLENBQUMsQ0FBQTtRQUNGLE9BQU87SUFDUixDQUFDO0NBQUE7QUFFRCxTQUFlLHNCQUFzQjs7UUFDcEMsSUFBSSxZQUFZLEdBQTJCO1lBQzFDLE1BQU0sRUFBRSxvQ0FBb0MsRUFBRSxhQUFhLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtnQkFDOUUsSUFBSSxDQUFDLEtBQUs7b0JBQUUsT0FBTztnQkFDbkIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUE7Z0JBQzNGLElBQUksU0FBUyxJQUFJLEtBQUssQ0FBQyxzQkFBc0I7b0JBQUUsT0FBTyxFQUFFLENBQUM7Z0JBQ3pELE9BQU8sc0JBQXNCLFNBQVMsR0FBRyxDQUFDO1lBQzNDLENBQUM7U0FDRCxDQUFDO1FBQ0YsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqRCxDQUFDO0NBQUE7QUFFRCxTQUFlLGtCQUFrQjs7UUFDaEMsSUFBSSxZQUFZLEdBQTJCO1lBQzFDLE1BQU0sRUFBRSw4QkFBOEI7WUFDdEMsYUFBYSxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxLQUFLO29CQUFFLE9BQU87Z0JBQ25CLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7b0JBQUUsT0FBTyw4QkFBOEIsQ0FBQztZQUNoRSxDQUFDO1NBQ0QsQ0FBQztRQUNGLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDakQsQ0FBQztDQUFBO0FBRUQsTUFBTSxZQUFZLEdBQUc7SUFDcEIsT0FBTyxFQUFFLGdCQUFnQjtJQUN6QixLQUFLLEVBQUUsRUFBRTtJQUNULEtBQUssRUFBRSxNQUFNO0lBQ2IsS0FBSyxFQUFFLHNCQUFzQjtJQUM3QixpQkFBaUI7SUFDakIsS0FBSyxFQUFFLGdCQUFnQjtJQUN2QixLQUFLLEVBQUUsa0JBQWtCO0lBQ3pCLEdBQUcsRUFBRSxTQUFTO0lBQ2QsS0FBSyxFQUFFLEVBQUU7SUFDVCxNQUFNLEVBQUUsb0JBQW9CO0lBQzVCLFlBQVksRUFBRSxVQUFVO0lBQ3hCLEtBQUssRUFBRSxFQUFFO0lBQ1QsS0FBSyxFQUFFLEVBQUU7SUFDVCxNQUFNLEVBQUUsRUFBRTtJQUNWLFNBQVMsRUFBRSxFQUFFO0lBQ2IsTUFBTSxFQUFFLEVBQUU7SUFDVixLQUFLLEVBQUUsZ0JBQWdCO0lBQ3ZCLEtBQUssRUFBRSxpQkFBaUI7SUFDeEIsS0FBSyxFQUFFLGlCQUFpQjtJQUN4QixzQkFBc0I7SUFDdEIsT0FBTyxFQUFFLGdCQUFnQjtJQUN6QixLQUFLLEVBQUUsRUFBRTtJQUNULE1BQU0sRUFBRSxrQkFBa0I7Q0FDMUIsQ0FBQSJ9