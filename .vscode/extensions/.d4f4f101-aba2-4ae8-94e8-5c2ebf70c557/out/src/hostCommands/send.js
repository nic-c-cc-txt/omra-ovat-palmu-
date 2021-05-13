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
const icon = "\u21E7" /* SEND */;
function sendElementHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let c = utils.getFullContext(context);
        if (c.mode === 3 /* EMPTY */) {
            let quickPick = yield environment.workspaceQuickPick();
            if (!quickPick)
                return;
            let chosenEnv = quickPick;
            let files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(chosenEnv.fsPath), canSelectMany: true, openLabel: 'Send' });
            if (!files)
                return;
            for (let fsPath of files.map(file => file.fsPath).sort(tableFirst)) {
                yield sendElement(fsPath).catch(() => { });
            }
        }
        else if (c.mode === 2 /* DIRECTORY */) {
            let files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(c.fsPath), canSelectMany: true, openLabel: 'Send' });
            if (!files)
                return;
            let sortedFiles = files.map(uri => uri.fsPath).sort(tableFirst);
            for (let fsPath of sortedFiles) {
                yield sendElement(fsPath).catch(() => { });
            }
        }
        if (c.mode === 1 /* FILE */) {
            return sendElement(c.fsPath).catch(() => { });
        }
        return;
    });
}
exports.sendElementHandler = sendElementHandler;
function sendTableHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let c = utils.getFullContext(context);
        if (c.mode === 3 /* EMPTY */) {
            return;
        }
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
            let files = yield fs.readdir(path.dirname(c.fsPath));
            let sortedFiles = files.filter(f => f.startsWith(tableName)).sort(tableFirst);
            if (sortedFiles.length > 99) {
                let resp = yield vscode.window.showInformationMessage(`Send ${sortedFiles.length} elements of ${tableName}?`, { modal: true }, 'Yes');
                if (resp !== 'Yes')
                    return;
            }
            for (let file of sortedFiles) {
                yield sendElement(path.join(path.dirname(c.fsPath), file)).catch(() => { });
            }
        }
        return;
    });
}
exports.sendTableHandler = sendTableHandler;
// async function sendDirectory(targetDir: string) {
// 	let fileNames = await fs.readdir(targetDir);
// 	let word = fileNames.length === 1 ? 'file' : 'files';
// 	let resp = await vscode.window.showInformationMessage(`Send contents of ${targetDir} (${fileNames.length} ${word})?`, { modal: true }, 'Yes');
// 	if (resp !== 'Yes') return;
// 	fileNames.sort(tableFirst);
// 	for (let index = 0; index < fileNames.length; index++) {
// 		let fileName = fileNames[index];
// 		// TODO what if element is a directory?
// 		await sendElement(path.join(targetDir, fileName));
// 	}
// }
function sendElement(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.statSync(fsPath).isFile())
            return;
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
        let promises = [];
        for (let env of envs) {
            promises.push(utils.executeWithProgress(`${icon} ${path.basename(fsPath)} SEND`, () => __awaiter(this, void 0, void 0, function* () {
                yield vscode.workspace.openTextDocument(fsPath).then(doc => doc.save());
                utils.logger.info(`${"\u2026" /* WAIT */} ${icon} ${path.basename(fsPath)} SEND to ${env.name}`);
                let connection = yield utils.getConnection(env);
                yield connection.send(fsPath);
                connection.close();
                utils.logger.info(`${"\u2714" /* SUCCESS */} ${icon} ${path.basename(fsPath)} SEND to ${env.name} successful`);
            })).catch((e) => {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} error in ${env.name} ${e.message}`);
            }));
        }
        ;
        yield Promise.all(promises);
    });
}
function tableFirst(a, b) {
    let aIsTable = a.endsWith('.TBL');
    let bIsTable = b.endsWith('.TBL');
    if (aIsTable && !bIsTable) {
        return -1;
    }
    else if (bIsTable && !aIsTable) {
        return 1;
    }
    return a.localeCompare(b);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ob3N0Q29tbWFuZHMvc2VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyw0Q0FBNEM7QUFDNUMsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQixxREFBcUQ7QUFFckQsTUFBTSxJQUFJLHNCQUFtQixDQUFDO0FBRTlCLFNBQXNCLGtCQUFrQixDQUFDLE9BQXNDOztRQUM5RSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxDQUFDLElBQUksa0JBQTRCLEVBQUU7WUFDdkMsSUFBSSxTQUFTLEdBQUcsTUFBTSxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUN2RCxJQUFJLENBQUMsU0FBUztnQkFBRSxPQUFPO1lBQ3ZCLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMxQixJQUFJLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO1lBQ3pJLElBQUksQ0FBQyxLQUFLO2dCQUFFLE9BQU87WUFDbkIsS0FBSyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDbkUsTUFBTSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzNDO1NBQ0Q7YUFDSSxJQUFJLENBQUMsQ0FBQyxJQUFJLHNC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