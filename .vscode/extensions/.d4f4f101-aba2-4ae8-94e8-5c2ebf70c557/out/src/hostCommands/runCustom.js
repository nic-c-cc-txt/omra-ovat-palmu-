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
const pslUnitTest_1 = require("./pslUnitTest");
const icon = "\u25B6" /* RUN */;
exports.testContext = {
    command: 'runTest',
    contextKey: 'psl.runTestContext',
};
exports.coverageContext = {
    command: 'runCoverage',
    contextKey: 'psl.runCoverageContext',
};
const customRunContexts = [exports.testContext, exports.coverageContext];
function runTestHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        handle(context, exports.testContext);
    });
}
exports.runTestHandler = runTestHandler;
function runCoverageHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        handle(context, exports.coverageContext);
    });
}
exports.runCoverageHandler = runCoverageHandler;
function handle(context, runContext) {
    return __awaiter(this, void 0, void 0, function* () {
        const c = utils.getFullContext(context);
        if (c.mode === 1 /* FILE */) {
            return runPSL(c.fsPath, runContext).catch(() => { });
        }
        else if (c.mode === 2 /* DIRECTORY */) {
            const files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(c.fsPath), canSelectMany: true, openLabel: 'Run PSL' });
            if (!files)
                return;
            for (const fsPath of files.map(file => file.fsPath)) {
                yield runPSL(fsPath, runContext).catch(() => { });
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
                yield runPSL(fsPath, runContext).catch(() => { });
            }
        }
        return;
    });
}
function runPSL(fsPath, runContext) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.statSync(fsPath).isFile())
            return;
        const doc = yield vscode.workspace.openTextDocument(fsPath);
        const config = getFromConfiguration(doc.uri, runContext);
        if (!config)
            throw new Error(`Invalid configuration for ${runContext.command}`);
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
                const output = yield runCustom(connection, fsPath, config, env);
                connection.close();
                utils.logger.info(output.trim());
            })).catch((e) => {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} error in ${env.name} ${e.message}`);
            }));
        }
        yield Promise.all(promises);
    });
}
function getFromConfiguration(uri, runContext) {
    const configs = vscode.workspace.getConfiguration('psl', uri).get('customTasks');
    const config = configs.find(c => c.command === runContext.command);
    if (!config || !config.mrpcID || !config.request) {
        return undefined;
    }
    return config;
}
function registerCustomRunContext() {
    if (vscode.window.activeTextEditor)
        setCustomRunContext(vscode.window.activeTextEditor);
    vscode.window.onDidChangeActiveTextEditor(setCustomRunContext);
}
exports.registerCustomRunContext = registerCustomRunContext;
function setCustomRunContext(textEditor) {
    for (const context of customRunContexts) {
        let showCommand = false;
        if (textEditor) {
            if (getFromConfiguration(textEditor.document.uri, context))
                showCommand = true;
        }
        vscode.commands.executeCommand('setContext', context.contextKey, showCommand);
    }
}
exports.setCustomRunContext = setCustomRunContext;
function runCustom(connection, fsPath, config, env) {
    return __awaiter(this, void 0, void 0, function* () {
        const output = yield connection.runCustom(fsPath, config.mrpcID, config.request);
        if (config.command !== exports.coverageContext.command)
            return output;
        const parsedOutput = pslUnitTest_1.parseCoverageOutput(output);
        if (parsedOutput.documents.length) {
            const items = parsedOutput.documents.map(documentCoverage => {
                return {
                    description: documentCoverage.coverage,
                    documentCoverage,
                    label: documentCoverage.name,
                };
            });
            vscode.window.showQuickPick(items, { canPickMany: true, placeHolder: 'Show coverage', ignoreFocusOut: true })
                .then(choices => {
                if (!choices || !choices.length)
                    return;
                pslUnitTest_1.displayCoverage(choices.map(x => x.documentCoverage), env, path.basename(fsPath));
            });
        }
        return parsedOutput.output;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuQ3VzdG9tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2hvc3RDb21tYW5kcy9ydW5DdXN0b20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyxxREFBcUQ7QUFFckQsNENBQTRDO0FBQzVDLCtDQUFzRjtBQUV0RixNQUFNLElBQUkscUJBQWtCLENBQUM7QUFPaEIsUUFBQSxXQUFXLEdBQXFCO0lBQzVDLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFVBQVUsRUFBRSxvQkFBb0I7Q0FDaEMsQ0FBQztBQUVXLFFBQUEsZUFBZSxHQUFxQjtJQUNoRCxPQUFPLEVBQUUsYUFBYTtJQUN0QixVQUFVLEVBQUUsd0JBQXdCO0NBQ3BDLENBQUM7QUFFRixNQUFNLGlCQUFpQixHQUFHLENBQUMsbUJBQVcsRUFBRSx1QkFBZSxDQUFDLENBQUM7QUFRekQsU0FBc0IsY0FBYyxDQUFDLE9BQXNDOztRQUMxRSxNQUFNLENBQUMsT0FBTyxFQUFFLG1CQUFXLENBQUMsQ0FBQztJQUM5QixDQUFDO0NBQUE7QUFGRCx3Q0FFQztBQUVELFNBQXNCLGtCQUFrQixDQUFDLE9BQXNDOztRQUM5RSxNQUFNLENBQUMsT0FBTyxFQUFFLHVCQUFlLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQUE7QUFGRCxnREFFQztBQUVELFNBQWUsTUFBTSxDQUFDLE9BQXNDLEVBQUUsVUFBNkI7O1FBQzFGLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLENBQUMsSUFBSSxpQkFBMkIsRUFBRTtZQUN0QyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNyRDthQUNJLElBQUksQ0FBQyxDQUFD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