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
const path = require("path");
const fs = require("fs-extra");
const utils = require("./hostCommandUtils");
const environment = require("../common/environment");
const icon = "\uD83D\uDD17" /* LINK */;
function compileAndLinkHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let c = utils.getFullContext(context);
        if (c.mode === 1 /* FILE */) {
            return compileAndLink(c.fsPath).catch(() => { });
        }
        else if (c.mode === 2 /* DIRECTORY */) {
            let files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(c.fsPath), canSelectMany: true, openLabel: 'Compile and Link' });
            if (!files)
                return;
            for (let fsPath of files.map(file => file.fsPath)) {
                yield compileAndLink(fsPath).catch(() => { });
            }
        }
        else {
            let quickPick = yield environment.workspaceQuickPick();
            if (!quickPick)
                return;
            let chosenEnv = quickPick;
            let files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(chosenEnv.fsPath), canSelectMany: true, openLabel: 'Compile and Link' });
            if (!files)
                return;
            for (let fsPath of files.map(file => file.fsPath)) {
                yield compileAndLink(fsPath).catch(() => { });
            }
        }
        return;
    });
}
exports.compileAndLinkHandler = compileAndLinkHandler;
function compileAndLink(fsPath) {
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
        yield vscode.workspace.openTextDocument(fsPath).then(doc => doc.save());
        for (let env of envs) {
            promises.push(utils.executeWithProgress(`${icon} ${path.basename(fsPath)} COMPILE AND LINK`, () => __awaiter(this, void 0, void 0, function* () {
                utils.logger.info(`${"\u2026" /* WAIT */} ${icon} ${path.basename(fsPath)} COMPILE AND LINK in ${env.name}`);
                let connection = yield utils.getConnection(env);
                let output = yield connection.compileAndLink(fsPath);
                connection.close();
                if (output.includes('compile and link successful'))
                    utils.logger.info(`${"\u2714" /* SUCCESS */} ${icon} ${path.basename(fsPath)} COMPILE AND LINK ${env.name} successful`);
                else
                    utils.logger.error(`${"\u274C" /* ERROR */} ${icon} ${output}`);
            })).catch((e) => {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} error in ${env.name} ${e.message}`);
            }));
        }
        yield Promise.all(promises);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZUFuZExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaG9zdENvbW1hbmRzL2NvbXBpbGVBbmRMaW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLDZCQUE2QjtBQUM3QiwrQkFBK0I7QUFFL0IsNENBQTRDO0FBQzVDLHFEQUFvRDtBQUVwRCxNQUFNLElBQUksNEJBQW1CLENBQUM7QUFFOUIsU0FBc0IscUJBQXFCLENBQUMsT0FBc0M7O1FBQ2pGLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLENBQUMsSUFBSSxpQkFBMkIsRUFBRTtZQUN0QyxPQUFPLGNBQWMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ2pEO2FBQ0ksSUFBSSxDQUFDLENBQUMsSUFBSSxzQkFBZ0MsRUFBRTtZQUNoRCxJQUFJLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUE7WUFDN0ksSUFBSSxDQUFDLEtBQUs7Z0JBQUUsT0FBTztZQUNuQixLQUFLLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2xELE1BQU0sY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUM5QztTQUNEO2FBQ0k7WUFDSixJQUFJLFNBQVMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU87WUFDdkIsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzFCLElBQUksS0FBSyxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFFLENBQUMsQ0FBQTtZQUNySixJQUFJLENBQUMsS0FBSztnQkFBRSxPQUFPO1lBQ25CLEtBQUssSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDbEQsTUFBTSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzlDO1NBQ0Q7UUFDRCxPQUFPO0lBQ1IsQ0FBQztDQUFBO0FBdkJELHNEQXVCQztBQUVELFNBQWUsY0FBYyxDQUFDLE1BQWM7O1FBQzNDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUFFLE9BQU07UUFDekMsSUFBSSxJQUFJLENBQUM7UUFDVCxJQUFJO1lBQ0gsSUFBSSxHQUFHLE1BQU0sS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMxQztRQUNELE9BQU8sQ0FBQyxFQUFFO1lBQ1QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBaUIsSUFBSSxJQUFJLHFDQUFxQyxDQUFDLENBQUM7WUFDdEYsT0FBTztTQUNQO1FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLG9CQUFpQixJQUFJLElBQUksNEJBQTRCLENBQUMsQ0FBQztZQUM3RSxPQUFPO1NBQ1A7UUFDRCxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7UUFDakIsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLEdBQVMsRUFBRTtnQkFDdkcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxtQkFBZ0IsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsd0JBQXdCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUMxRyxJQUFJLFVBQVUsR0FBRyxNQUFNLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELElBQUksTUFBTSxHQUFHLE1BQU0sVUFBVSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckQsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNuQixJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsNkJBQTZCLENBQUM7b0JBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxzQkFBbUIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxDQUFBOztvQkFDbkssS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBaUIsSUFBSSxJQUFJLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNuRSxDQUFDLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQVEsRUFBRSxFQUFFO2dCQUNyQixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLG9CQUFpQixJQUFJLElBQUksYUFBYSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3RGLENBQUMsQ0FBQyxDQUFDLENBQUE7U0FDSDtRQUNELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QixDQUFDO0NBQUEifQ==