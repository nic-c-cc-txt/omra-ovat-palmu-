#!/usr/bin/env node
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
const commander = require("commander");
const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const process = require("process");
const parser_1 = require("../../parser/parser");
const activate_1 = require("../activate");
const api_1 = require("../api");
const config_1 = require("../config");
const diagnosticStore = new Map();
let useConfig;
function getMessage(storedDiagnostic) {
    const { diagnostic, fsPath } = storedDiagnostic;
    const range = `${diagnostic.range.start.line + 1},${diagnostic.range.start.character + 1}`;
    const severity = `${api_1.DiagnosticSeverity[diagnostic.severity].substr(0, 4).toUpperCase()}`;
    return `${fsPath}(${range}) [${severity}][${diagnostic.source}][${diagnostic.ruleName}] ${diagnostic.message}`;
}
function readFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        let errorCount = 0;
        const fsPath = path.relative(process.cwd(), filename);
        if (!api_1.ProfileComponent.isProfileComponent(fsPath)) {
            return errorCount;
        }
        const textDocument = (yield fs.readFile(fsPath)).toString();
        const parsedDocument = api_1.ProfileComponent.isPsl(fsPath) ? parser_1.parseText(textDocument) : undefined;
        const profileComponent = new api_1.ProfileComponent(fsPath, textDocument);
        const diagnostics = activate_1.getDiagnostics(profileComponent, parsedDocument, useConfig);
        diagnostics.forEach(diagnostic => {
            if (diagnostic.severity === api_1.DiagnosticSeverity.Warning || diagnostic.severity === api_1.DiagnosticSeverity.Error) {
                errorCount += 1;
            }
            const mapDiagnostics = diagnosticStore.get(diagnostic.source);
            if (!mapDiagnostics)
                diagnosticStore.set(diagnostic.source, [{ diagnostic, fsPath }]);
            else
                mapDiagnostics.push({ diagnostic, fsPath });
        });
        return errorCount;
    });
}
function readPath(fileString) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = fileString.split(';').filter(x => x);
        const promises = [];
        let exitCode = 0;
        for (const filePath of files) {
            const absolutePath = path.resolve(filePath);
            if (!absolutePath)
                continue;
            const stat = yield fs.lstat(absolutePath);
            if (stat.isDirectory()) {
                const fileNames = yield fs.readdir(absolutePath);
                for (const fileName of fileNames) {
                    const absolutePathInDir = path.resolve(path.join(absolutePath, fileName));
                    yield readPath(absolutePathInDir);
                }
            }
            else if (stat.isFile()) {
                const promise = readFile(absolutePath).then(errorCount => {
                    exitCode += errorCount;
                }).catch((e) => {
                    if (e.message)
                        console.error(absolutePath, e.message, e.stack);
                    else
                        console.error(absolutePath, e);
                });
                promises.push(promise);
            }
        }
        yield Promise.all(promises);
        return exitCode;
    });
}
exports.readPath = readPath;
function processConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        const configPath = path.join(process.cwd(), 'psl-lint.json');
        yield fs.lstat(configPath).then(() => __awaiter(this, void 0, void 0, function* () {
            yield config_1.setConfig(configPath);
            useConfig = true;
        })).catch(() => {
            useConfig = false;
        });
    });
}
function outputResults(reportFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (reportFileName) {
            yield generateCodeQualityReport(reportFileName);
            console.log('Finished report.');
        }
        else {
            printOutputToConsole();
            console.log('Finished lint.');
        }
    });
}
function printOutputToConsole() {
    for (const source of diagnosticStore.keys()) {
        const diagnostics = diagnosticStore.get(source);
        const word = diagnosticStore.get(source).length === 1 ? 'diagnostic' : 'diagnostics';
        console.log(`[${source}] ${diagnostics.length} ${word}:`);
        diagnostics.forEach(diagnostic => {
            console.log(getMessage(diagnostic));
        });
    }
}
function generateCodeQualityReport(reportFileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const counts = {};
        const issues = [];
        for (const ruleDiagnostics of diagnosticStore.values()) {
            for (const storedDiagnostic of ruleDiagnostics) {
                const { diagnostic, fsPath } = storedDiagnostic;
                const count = counts[diagnostic.ruleName];
                if (!count) {
                    counts[diagnostic.ruleName] = 1;
                }
                else {
                    counts[diagnostic.ruleName] = counts[diagnostic.ruleName] + 1;
                }
                if (diagnostic.ruleName === 'MemberCamelCase')
                    continue;
                const issue = {
                    check_name: diagnostic.ruleName,
                    description: `[${diagnostic.ruleName}] ${diagnostic.message.trim().replace(/\.$/, '')}`,
                    fingerprint: hashObject(diagnostic),
                    location: {
                        lines: {
                            begin: diagnostic.range.start.line + 1,
                            end: diagnostic.range.end.line + 1,
                        },
                        path: fsPath,
                    },
                };
                issues.push(issue);
            }
        }
        console.log('Diagnostics found in repository:');
        console.table(counts);
        yield fs.writeFile(reportFileName, JSON.stringify(issues));
    });
}
function hashObject(object) {
    const hash = crypto.createHash('md5')
        .update(JSON.stringify(object, (key, value) => {
        if (key[0] === '_')
            return undefined; // remove api stuff
        else if (typeof value === 'function') { // consider functions
            return value.toString();
        }
        else
            return value;
    }))
        .digest('hex');
    return hash;
}
function getCliArgs() {
    commander
        .name('psl-lint')
        .usage('<fileString>')
        .option('-o, --output <output>', 'Name of output file')
        .description('fileString    a ; delimited string of file paths')
        .parse(process.argv);
    return { fileString: commander.args[0], reportFileName: commander.output };
}
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (require.main !== module) {
            return;
        }
        const { fileString, reportFileName } = getCliArgs();
        if (fileString) {
            yield processConfig();
            if (reportFileName)
                console.log('Starting report.');
            else
                console.log('Starting lint.');
            const exitCode = yield readPath(fileString);
            yield outputResults(reportFileName);
            process.exit(exitCode);
        }
        else {
            console.log('Nothing to lint.');
        }
    });
})();
// psl-lint $(git diff master...${CI_BUILD_REF_NAME} --name-only | tr "\n" ";")
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3BzbExpbnQvY2xpL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSx1Q0FBdUM7QUFDdkMsaUNBQWlDO0FBQ2pDLCtCQUErQjtBQUMvQiw2QkFBNkI7QUFDN0IsbUNBQW1DO0FBQ25DLGdEQUFnRDtBQUNoRCwwQ0FBNkM7QUFDN0MsZ0NBQTBFO0FBQzFFLHNDQUFzQztBQXlCdEMsTUFBTSxlQUFlLEdBQW9DLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbkUsSUFBSSxTQUFrQixDQUFDO0FBRXZCLFNBQVMsVUFBVSxDQUFDLGdCQUFrQztJQUNyRCxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLGdCQUFnQixDQUFDO0lBQ2hELE1BQU0sS0FBSyxHQUFHLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDM0YsTUFBTSxRQUFRLEdBQUcsR0FBRyx3QkFBa0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO0lBQ3pGLE9BQU8sR0FBRyxNQUFNLElBQUksS0FBSyxNQUFNLFFBQVEsS0FBSyxVQUFVLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQyxRQUFRLEtBQUssVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2hILENBQUM7QUFFRCxTQUFlLFFBQVEsQ0FBQyxRQUFnQjs7UUFDdkMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFD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