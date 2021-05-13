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
const diagnostics_1 = require("../common/diagnostics");
const extension = require("../extension");
const environment = require("../common/environment");
const icon = "\u2699" /* TEST */;
function testCompileHandler(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let c = utils.getFullContext(context);
        let diagnostics = [];
        if (c.mode === 1 /* FILE */) {
            yield testCompile(c.fsPath).catch(() => { });
        }
        else if (c.mode === 2 /* DIRECTORY */) {
            let files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(c.fsPath), canSelectMany: true, openLabel: 'Test Compile' });
            if (!files)
                return;
            for (let fsPath of files.map(file => file.fsPath)) {
                let result = yield testCompile(fsPath).catch(() => { });
                if (result)
                    diagnostics = diagnostics.concat(result);
            }
        }
        else {
            let quickPick = yield environment.workspaceQuickPick();
            if (!quickPick)
                return;
            let chosenEnv = quickPick;
            let files = yield vscode.window.showOpenDialog({ defaultUri: vscode.Uri.file(chosenEnv.fsPath), canSelectMany: true, openLabel: 'Test Compile' });
            if (!files)
                return;
            for (let fsPath of files.map(file => file.fsPath)) {
                let result = yield testCompile(fsPath);
                if (result)
                    diagnostics = diagnostics.concat(result);
            }
        }
    });
}
exports.testCompileHandler = testCompileHandler;
function testCompile(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileStats = yield fs.stat(fsPath);
        if (!fileStats.isFile()) {
            utils.logger.error(`${"\u274C" /* ERROR */} ${icon} ${fsPath} is not a file.`);
            return true;
        }
        let textDocument = yield vscode.workspace.openTextDocument(fsPath);
        if (!canTestCompileFile(textDocument, fsPath)) {
            // The error message for the specific error was already added in 'canTestCompileFile'
            return true;
        }
        let testCompileSucceeded = false;
        let envs;
        try {
            envs = yield utils.getEnvironment(fsPath);
        }
        catch (e) {
            utils.logger.error(`${"\u274C" /* ERROR */} ${icon} Invalid environment configuration.`);
            return true;
        }
        if (envs.length === 0) {
            utils.logger.error(`${"\u274C" /* ERROR */} ${icon} No environments selected.`);
            return true;
        }
        let testCompiles = [];
        for (let env of envs) {
            testCompiles.push(utils.executeWithProgress(`${icon} ${path.basename(fsPath)} TEST COMPILE`, () => __awaiter(this, void 0, void 0, function* () {
                yield textDocument.save();
                utils.logger.info(`${"\u2026" /* WAIT */} ${icon} ${path.basename(fsPath)} TEST COMPILE in ${env.name}`);
                let connection = yield utils.getConnection(env);
                let output = yield connection.testCompile(fsPath);
                connection.close();
                let pslDiagnostics = parseCompilerOutput(output, textDocument);
                testCompileSucceeded = pslDiagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length === 0;
                let testCompileWarning = pslDiagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Warning).length > 0;
                if (!testCompileSucceeded) {
                    output = `${"\u274C" /* ERROR */} ${icon} ${path.basename(fsPath)} TEST COMPILE in ${env.name} failed\n` + output;
                }
                else if (testCompileWarning) {
                    output = `${"\u26A0" /* WARN */} ${icon} ${path.basename(fsPath)} TEST COMPILE in ${env.name} succeeded with warning\n` + output;
                }
                else {
                    output = `${"\u2714" /* SUCCESS */} ${icon} ${path.basename(fsPath)} TEST COMPILE in ${env.name} succeeded\n` + output;
                }
                utils.logger.info(output.split('\n').join('\n' + ' '.repeat(20)));
                diagnostics_1.PSLDiagnostic.setDiagnostics(pslDiagnostics, env.name, fsPath);
            })).catch((e) => {
                utils.logger.error(`${"\u274C" /* ERROR */} ${icon} error in ${env.name} ${e.message}`);
            }));
        }
        return false;
    });
}
exports.testCompile = testCompile;
function parseCompilerOutput(compilerOutput, document) {
    /*
    ZFeatureToggleUtilities.PROC compiled at 15:31 on 29-05-17
    Source: ZFeatureToggleUtilities.PROC

    %PSL-E-SYNTAX: Missing #PROPERTYDEF
    In module: ZFeatureToggleUtilities

    Source: ZFeatureToggleUtilities.PROC
        #PROPEYDEF dummy class = String private node = "dummy"
    %PSL-E-SYNTAX: Unexpected compiler command: PROPEYDEF
    At source code line: 25 in subroutine:

    Source: ZFeatureToggleUtilities.PROC

    %PSL-I-LIST: 2 errors, 0 warnings, 0 informational messages ** failed **
    In module: ZFeatureToggleUtilities
    */
    let outputArrays = splitCompilerOutput(compilerOutput);
    let pslDiagnostics = [];
    outputArrays.slice(0, outputArrays.length - 1).forEach(pslCompilerMessage => {
        let lineNumber = pslCompilerMessage.getLineNumber();
        if (lineNumber - 1 > document.lineCount || lineNumber <= 0)
            return;
        let codeLine = document.lineAt(lineNumber - 1).text;
        let startIndex = codeLine.search(/\S/); // returns the index of the first non-whitespace character
        if (startIndex === -1)
            startIndex = 0; // codeLine is only whitespace characters
        let range = new vscode.Range(lineNumber - 1, startIndex, lineNumber - 1, codeLine.length);
        let severity = pslCompilerMessage.getSeverity();
        if (severity >= 0) {
            pslDiagnostics.push(new diagnostics_1.PSLDiagnostic(`${pslCompilerMessage.message}`, severity, document.fileName, range));
        }
    });
    return pslDiagnostics;
}
function canTestCompileFile(document, fsPath) {
    let compilable = false;
    if (vscode.languages.match(extension.PSL_MODE, document)) {
        compilable = true;
    }
    else {
        let fileTypeDescription = "";
        if (vscode.languages.match(extension.BATCH_MODE, document)) {
            fileTypeDescription = "Batch";
        }
        else if (vscode.languages.match(extension.COL_MODE, document)) {
            fileTypeDescription = "Column Definition";
        }
        else if (vscode.languages.match(extension.DATA_MODE, document)) {
            fileTypeDescription = "Data File";
        }
        else if (vscode.languages.match(extension.TBL_MODE, document)) {
            fileTypeDescription = "Table Definition";
        }
        else if (vscode.languages.match(extension.TRIG_MODE, document)) {
            fileTypeDescription = "Trigger";
        }
        if (fileTypeDescription != "") {
            utils.logger.error(`${"\u274C" /* ERROR */} ${icon} ${fileTypeDescription} ${path.basename(fsPath)} cannot be test compiled.`);
        }
        else {
            utils.logger.error(`${"\u274C" /* ERROR */} ${icon} ${path.basename(fsPath)} is not a PSL file.`);
        }
    }
    return compilable;
}
class PSLCompilerMessage {
    isFilled() {
        return (this.source && this.message && this.location) !== '';
    }
    getLineNumber() {
        if (this.location.startsWith('In module:'))
            return -1;
        return parseInt(this.location.replace('At source code line: ', '').split(' ')[0]);
    }
    getSeverity() {
        if (this.message.startsWith('%PSL-W-')) {
            return vscode.DiagnosticSeverity.Warning;
        }
        else if (this.message.startsWith('%PSL-E-')) {
            return vscode.DiagnosticSeverity.Error;
        }
        else if (this.message.startsWith('%PSL-I-')) {
            return vscode.DiagnosticSeverity.Information;
        }
        return -1;
    }
}
function splitCompilerOutput(compilerOutput) {
    /**
     * breaks apart the psl compiler output string into an arrays of compiler messages
     */
    let outputArrays = [];
    let compilerMessage;
    let splitCompilerOutput = compilerOutput.replace(/\r/g, '').trim().split('\n');
    for (let i = 1; i < splitCompilerOutput.length; i++) {
        compilerMessage = new PSLCompilerMessage();
        compilerMessage.source = splitCompilerOutput[i];
        compilerMessage.code = splitCompilerOutput[i + 1];
        compilerMessage.message = splitCompilerOutput[i + 2];
        compilerMessage.location = splitCompilerOutput[i + 3];
        if (compilerMessage.isFilled())
            outputArrays.push(compilerMessage);
        i = i + 4;
    }
    return outputArrays;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvbXBpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaG9zdENvbW1hbmRzL3Rlc3RDb21waWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLDRDQUE0QztBQUM1Qyw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLHVEQUFzRDtBQUN0RCwwQ0FBMEM7QUFDMUMscURBQXFEO0FBRXJELE1BQU0sSUFBSSxzQkFBbUIsQ0FBQztBQUU5QixTQUFzQixrQkFBa0IsQ0FBQyxPQUFzQzs7UUFDOUUsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QyxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7UUFDcEIsSUFBSSxDQUFDLENBQUMsSUFBSSxpQkFBMkIsRUFBRTtZQUN0QyxNQUFNLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzdDO2FBQ0ksSUFBSSxDQUFDLENBQUMsSUFBSSxzQkFBZ0MsRUFBRTtZQUNoRCxJQUFJLEtBQUssR0FBRyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFBO1lBQ3pJLElBQUksQ0FBQyxLQUFLO2dCQUFFLE9BQU87WUFDbkIsS0FBSyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNsRCxJQUFJLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELElBQUksTUFBTTtvQkFBRSxXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNyRDtTQUNEO2FBQ0k7WUFDSixJQUFJLFNBQVMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU87WUFDdkIsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzFCLElBQUksS0FBSyxHQUFHLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUE7WUFDakosSUFBSSxDQUFDLEtBQUs7Z0JBQUUsT0FBTztZQUNuQixLQUFLLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2xELElBQUksTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLE1BQU07b0JBQUUsV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDckQ7U0FDRDtJQUNGLENBQUM7Q0FBQTtBQXpCRCxnREF5QkM7QUFFRCxTQUFzQixXQUFXLENBQUMsTUFBYzs7UUFDL0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDeEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBaUIsSUFBSSxJQUFJLElBQUksTUFBTSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzVFLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxJQUFJLFlBQVksR0FBRyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsRUFBRTtZQUM5QyxxRkFBcUY7WUFDckYsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELElBQUksb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLElBQUksSUFBSSxDQUFDO1FBQ1QsSUFBSTtZQUNILElBQUksR0FBRyxNQUFNLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDMUM7UUFDRCxPQUFPLENBQUMsRUFBRTtZQUNULEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsb0JBQWlCLElBQUksSUFBSSxxQ0FBcUMsQ0FBQyxDQUFDO1lBQ3RGLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsb0JBQWlCLElBQUksSUFBSSw0QkFBNEIsQ0FBQyxDQUFDO1lBQzdFLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFDRCxJQUFJLFlBQVksR0FBb0IsRUFBRSxDQUFDO1FBQ3ZDLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ3JCLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxHQUFTLEVBQUU7Z0JBQ3ZHLE1BQU0sWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMxQixLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLG1CQUFnQixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3RHLElBQUksVUFBVSxHQUFHLE1BQU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNsRCxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ25CLElBQUksY0FBYyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDL0Qsb0JBQW9CLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssTUFBTSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7Z0JBQy9HLElBQUksa0JBQWtCLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssTUFBTSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ2pILElBQUksQ0FBQyxvQkFBb0IsRUFBRTtvQkFDMUIsTUFBTSxHQUFHLEdBQUcsb0JBQWlCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLG9CQUFvQixHQUFHLENBQUMsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFBO2lCQUM5RztxQkFDSSxJQUFJLGtCQUFrQixFQUFFO29CQUM1QixNQUFNLEdBQUcsR0FBRyxtQkFBZ0IsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxJQUFJLDJCQUEyQixHQUFHLE1BQU0sQ0FBQTtpQkFDN0g7cUJBQ0k7b0JBQ0osTUFBTSxHQUFHLEdBQUcsc0JBQW1CLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLG9CQUFvQixHQUFHLENBQUMsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFBO2lCQUNuSDtnQkFDRCxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLDJCQUFhLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2hFLENBQUMsQ0FBQSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBUSxFQUFFLEVBQUU7Z0JBQ3JCLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsb0JBQWlCLElBQUksSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDdEYsQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNIO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0NBQUE7QUFwREQsa0NBb0RDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxjQUFzQixFQUFFLFFBQTZCO0lBQ2pGOzs7Ozs7Ozs7Ozs7Ozs7O01BZ0JFO0lBQ0YsSUFBSSxZQUFZLEdBQThCLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2xGLElBQUksY0FBYyxHQUFvQixFQUFFLENBQUM7SUFDekMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUUzRSxJQUFJLFVBQVUsR0FBVyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUM1RCxJQUFJLFVBQVUsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLFNBQVMsSUFBSSxVQUFVLElBQUksQ0FBQztZQUFFLE9BQU87UUFFbkUsSUFBSSxRQUFRLEdBQVcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzVELElBQUksVUFBVSxHQUFXLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQywwREFBMEQ7UUFDMUcsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDO1lBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLHlDQUF5QztRQUNoRixJQUFJLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxVQUFVLEVBQUUsVUFBVSxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUYsSUFBSSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDaEQsSUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFO1lBQ2xCLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSwyQkFBYSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUM1RztJQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxjQUFjLENBQUM7QUFDdkIsQ0FBQztBQUVELFNBQVMsa0JBQWtCLENBQUMsUUFBNkIsRUFBRSxNQUFjO0lBQ3hFLElBQUksVUFBVSxHQUFZLEtBQUssQ0FBQztJQUNoQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUU7UUFDekQsVUFBVSxHQUFHLElBQUksQ0FBQztLQUNsQjtTQUNJO1FBQ0osSUFBSSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7UUFDN0IsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQzNELG1CQUFtQixHQUFHLE9BQU8sQ0FBQTtTQUM3QjthQUNJLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRTtZQUM5RCxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQTtTQUN6QzthQUNJLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsRUFBRTtZQUMvRCxtQkFBbUIsR0FBRyxXQUFXLENBQUE7U0FDakM7YUFDSSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDOUQsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUE7U0FDeEM7YUFDSSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDL0QsbUJBQW1CLEdBQUcsU0FBUyxDQUFBO1NBQy9CO1FBQ0QsSUFBSSxtQkFBbUIsSUFBSSxFQUFFLEVBQUU7WUFDOUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBaUIsSUFBSSxJQUFJLElBQUksbUJBQW1CLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztTQUM1SDthQUNJO1lBQ0osS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBaUIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQztTQUMvRjtLQUNEO0lBQ0QsT0FBTyxVQUFVLENBQUM7QUFDbkIsQ0FBQztBQUVELE1BQU0sa0JBQWtCO0lBTXZCLFFBQVE7UUFDUCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDOUQsQ0FBQztJQUNELGFBQWE7UUFDWixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDdEQsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUNELFdBQVc7UUFDVixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3ZDLE9BQU8sTUFBTSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztTQUN6QzthQUNJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDNUMsT0FBTyxNQUFNLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO1NBQ3ZDO2FBQ0ksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM1QyxPQUFPLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUM7U0FDN0M7UUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztDQUNEO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxjQUFzQjtJQUNsRDs7T0FFRztJQUNILElBQUksWUFBWSxHQUE4QixFQUFFLENBQUM7SUFDakQsSUFBSSxlQUFtQyxDQUFDO0lBRXhDLElBQUksbUJBQW1CLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9FLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDcEQsZUFBZSxHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQztRQUMzQyxlQUFlLENBQUMsTUFBTSxHQUFHLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hELGVBQWUsQ0FBQyxJQUFJLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2xELGVBQWUsQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JELGVBQWUsQ0FBQyxRQUFRLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksZUFBZSxDQUFDLFFBQVEsRUFBRTtZQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbkUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDVjtJQUNELE9BQU8sWUFBWSxDQUFDO0FBQ3JCLENBQUMifQ==