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
const icon = "\uD83D\uDD03" /* REFRESH */;
function refreshElementHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let c = utils.getFullContext(context);
        if (c.mode === 1 /* FILE */) {
            return refreshElement(c.fsPath).catch(() => { });
        }
        else if (c.mode === 2 /* DIRECTORY */) {
            let files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(c.fsPath), canSelectMany: true, openLabel: 'Refresh' });
            if (!files)
                return;
            for (let fsPath of files.map(file => file.fsPath)) {
                yield refreshElement(fsPath).catch(() => { });
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
                yield refreshElement(fsPath).catch(() => { });
            }
        }
        return;
    });
}
exports.refreshElementHandler = refreshElementHandler;
function refreshElement(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.statSync(fsPath).isFile())
            return;
        let env;
        return utils.executeWithProgress(`${icon} ${path.basename(fsPath)} REFRESH`, () => __awaiter(this, void 0, void 0, function* () {
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
            utils.logger.info(`${"\u2026" /* WAIT */} ${icon} ${path.basename(fsPath)} REFRESH from ${env.name}`);
            let doc = yield vscode.workspace.openTextDocument(fsPath);
            yield doc.save();
            let connection = yield utils.getConnection(env);
            let output = yield connection.get(fsPath);
            yield utils.writeFileWithSettings(fsPath, output);
            utils.logger.info(`${"\u2714" /* SUCCESS */} ${icon} ${path.basename(fsPath)} REFRESH from ${env.name} succeeded`);
            connection.close();
            yield vscode.window.showTextDocument(doc);
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
function refreshTableHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let c = utils.getFullContext(context);
        if (c.mode === 1 /* FILE */) {
            let tableName;
            if (path.extname(c.fsPath) === '.TBL') {
                tableName = path.basename(c.fsPath).split('.TBL')[0];
            }
            else if (path.extname(c.fsPath) === '.COL') {
                tableName = path.basename(c.fsPath).split('.COL')[0].split('-')[0];
            }
            else {
                return;
            }
            let targetDir = path.dirname(c.fsPath);
            return refreshTable(tableName, targetDir).catch(() => { });
        }
    });
}
exports.refreshTableHandler = refreshTableHandler;
function refreshTable(tableName, targetDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        let env;
        yield utils.executeWithProgress(`${icon} ${tableName} TABLE REFRESH`, () => __awaiter(this, void 0, void 0, function* () {
            let envs = yield utils.getEnvironment(targetDirectory);
            let choice = yield utils.getCommandenvConfigQuickPick(envs);
            if (!choice)
                return;
            env = choice;
            utils.logger.info(`${"\u2026" /* WAIT */} ${icon} ${tableName} TABLE REFRESH from ${env.name}`);
            let connection = yield utils.getConnection(env);
            let output = yield connection.getTable(tableName.toUpperCase() + '.TBL');
            let tableFiles = (yield fs.readdir(targetDirectory)).filter(f => f.startsWith(tableName));
            for (let file of tableFiles) {
                yield fs.remove(file);
            }
            const promises = output.split(String.fromCharCode(0)).map(content => {
                const contentArray = content.split(String.fromCharCode(1));
                const fileName = contentArray[0];
                const fileContent = contentArray[1];
                return utils.writeFileWithSettings(path.join(targetDirectory, fileName), fileContent);
            });
            yield Promise.all(promises);
            utils.logger.info(`${"\u2714" /* SUCCESS */} ${icon} ${tableName} TABLE REFRESH from ${env.name} succeeded`);
            connection.close();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmcmVzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ob3N0Q29tbWFuZHMvcmVmcmVzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyw0Q0FBNEM7QUFDNUMsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQixxREFBcUQ7QUFFckQsTUFBTSxJQUFJLCtCQUFzQixDQUFDO0FBRWpDLFNBQXNCLHFCQUFxQixDQUFDLE9BQXNDOztRQUNqRixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxDQUFDLElBQUksaUJBQTJCLEVBQUU7WUFDdEMsT0FBTyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMsQ0FBQztTQUNoRDthQUNJLElBQUksQ0FBQyxDQUFDLElBQUksc0JBQWdDLEVBQUU7WUFDaEQsSUFBSSxLQUFLLEdBQUcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQTtZQUNsSSxJQUFJLENBQUMsS0FBSztnQkFBRSxPQUFPO1lBQ25CLEtBQUssSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDbEQsTUFBTSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzdDO1NBQ0Q7YUFDSTtZQUNKLElBQUksU0FBUyxHQUFHLE1BQU0sV0FB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