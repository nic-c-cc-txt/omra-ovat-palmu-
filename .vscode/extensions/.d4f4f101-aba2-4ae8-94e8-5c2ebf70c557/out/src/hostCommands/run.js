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
const fs = require("fs-extra");
const path = require("path");
const vscode = require("vscode");
const environment = require("../common/environment");
const utils = require("./hostCommandUtils");
const icon = "\u25B6" /* RUN */;
function runPSLHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        handle(context);
    });
}
exports.runPSLHandler = runPSLHandler;
function handle(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const c = utils.getFullContext(context);
        if (c.mode === 1 /* FILE */) {
            return runPSL(c.fsPath).catch(() => { });
        }
        else if (c.mode === 2 /* DIRECTORY */) {
            const files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(c.fsPath), canSelectMany: true, openLabel: 'Run PSL' });
            if (!files)
                return;
            for (const fsPath of files.map(file => file.fsPath)) {
                yield runPSL(fsPath).catch(() => { });
            }
        }
        else {
            const quickPick = yield environment.workspaceQuickPick();
            if (!quickPick)
                return;
            const chosenEnv = quickPick;
            const files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(chosenEnv.fsPath), canSelectMany: true, openLabel: 'Run PSL' });
            if (!files)
                return;
            for (const fsPath of files.map(file => file.fsPath)) {
                yield runPSL(fsPath).catch(() => { });
            }
        }
        return;
    });
}
function runPSL(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.statSync(fsPath).isFile())
            return;
        const doc = yield vscode.workspace.openTextDocument(fsPath);
        yield doc.save();
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
        const promises = [];
        for (const env of envs) {
            promises.push(utils.executeWithProgress(`${icon} ${path.basename(fsPath)} RUN`, () => __awaiter(this, void 0, void 0, function* () {
                utils.logger.info(`${"\u2026" /* WAIT */} ${icon} ${path.basename(fsPath)} RUN in ${env.name}`);
                const connection = yield utils.getConnection(env);
                const output = yield connection.runPsl(fsPath);
                connection.close();
                utils.logger.info(output.trim());
            })).catch((e) => {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} error in ${env.name} ${e.message}`);
            }));
        }
        yield Promise.all(promises);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hvc3RDb21tYW5kcy9ydW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyxxREFBcUQ7QUFDckQsNENBQTRDO0FBRTVDLE1BQU0sSUFBSSxxQkFBa0IsQ0FBQztBQUU3QixTQUFzQixhQUFhLENBQUMsT0FBc0M7O1FBQ3pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqQixDQUFDO0NBQUE7QUFGRCxzQ0FFQztBQUVELFNBQWUsTUFBTSxDQUFDLE9BQXNDOztRQUMzRCxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxDQUFDLElBQUksaUJBQTJCLEVBQUU7WUFDdEMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUN6QzthQUNJLElBQUksQ0FBQyxDQUFDLElBQUksc0JBQWdDLEVBQUU7WUFDaEQsTUFBTSxLQUFLLEdBQUcsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUN2SSxJQUFJLENBQUMsS0FBSztnQkFBRSxPQUFPO1lBQ25CLEtBQUssTUFBTSxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDcEQsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFD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