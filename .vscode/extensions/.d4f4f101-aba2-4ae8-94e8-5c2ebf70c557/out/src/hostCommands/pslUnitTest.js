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
const mumps_1 = require("../language/mumps");
const hostCommandUtils_1 = require("./hostCommandUtils");
var CoverageIndicator;
(function (CoverageIndicator) {
    CoverageIndicator[CoverageIndicator["NOT_COVERED"] = 0] = "NOT_COVERED";
    CoverageIndicator[CoverageIndicator["COVERED"] = 1] = "COVERED";
    CoverageIndicator[CoverageIndicator["COMMENT"] = 2] = "COMMENT";
})(CoverageIndicator || (CoverageIndicator = {}));
const diagnosticCollection = vscode.languages.createDiagnosticCollection('psl-test');
const coverageScheme = mumps_1.MumpsVirtualDocument.schemes.coverage;
function createDecoration(backgroundKey, rulerKey) {
    return vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor(backgroundKey),
        isWholeLine: true,
        overviewRulerColor: new vscode.ThemeColor(rulerKey),
        overviewRulerLane: vscode.OverviewRulerLane.Full,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
    });
}
const notCovered = createDecoration('diffEditor.removedTextBackground', 'editorOverviewRuler.errorForeground');
const covered = createDecoration('diffEditor.insertedTextBackground', 'diffEditor.insertedTextBackground');
mumps_1.onDidDeleteVirtualMumps(uri => {
    if (uri.scheme === coverageScheme) {
        diagnosticCollection.delete(uri);
    }
});
vscode.window.onDidChangeActiveTextEditor(textEditor => {
    if (textEditor && textEditor.document.uri.scheme === coverageScheme) {
        setCoverageDecorations(textEditor);
    }
});
function displayCoverage(documents, env, testName) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseUri = vscode.Uri.parse(`${coverageScheme}:`);
        const connection = yield hostCommandUtils_1.getConnection(env);
        for (const documentCoverage of documents) {
            yield connection.get(`${documentCoverage.name}.m`).then(mCode => {
                const sourceCode = mCode;
                const uri = baseUri.with({
                    path: `/${env.name}/${testName}/${documentCoverage.name}.m`,
                    query: JSON.stringify(documentCoverage),
                });
                const virtualMumps = new mumps_1.MumpsVirtualDocument(documentCoverage.name, sourceCode, uri);
                setCoverageDiagnostics(virtualMumps);
                vscode.window.showTextDocument(virtualMumps.uri, { preview: false });
            });
        }
    });
}
exports.displayCoverage = displayCoverage;
function getRoutineCoverage(uri) {
    return JSON.parse(uri.query);
}
function setCoverageDiagnostics(virtualMumps) {
    let allDiagnostics = [];
    getRoutineCoverage(virtualMumps.uri).methods.forEach(coverageMethod => {
        const documentMethod = virtualMumps.parsedDocument.methods.find(method => {
            return method.id.value === coverageMethod.name;
        });
        if (!documentMethod)
            return;
        const methodRanges = collectMethodRanges(coverageMethod);
        const diagnostics = methodRanges.map(methodRange => {
            const vscodeRange = new vscode.Range(documentMethod.line + methodRange.start, 0, documentMethod.line + methodRange.end, Number.MAX_VALUE);
            return new vscode.Diagnostic(vscodeRange, `Missing coverage in method "${coverageMethod.name}"`, vscode.DiagnosticSeverity.Error);
        });
        allDiagnostics = [...allDiagnostics, ...diagnostics];
    });
    diagnosticCollection.set(virtualMumps.uri, allDiagnostics);
}
function collectMethodRanges(methodCoverage) {
    const ranges = [];
    let previousIndicator;
    const last = methodCoverage.coverageSequence.reduce((range, lineCoverage, index) => {
        let indicator;
        if (indicator === CoverageIndicator.COMMENT)
            indicator = previousIndicator;
        else
            indicator = lineCoverage.indicator;
        if (indicator === CoverageIndicator.NOT_COVERED) {
            if (!range) {
                previousIndicator = indicator;
                return { start: index, end: index };
            }
            else {
                previousIndicator = indicator;
                range.end = index;
                return range;
            }
        }
        if (indicator === CoverageIndicator.COVERED && range) {
            previousIndicator = indicator;
            ranges.push(range);
        }
    }, undefined);
    if (last)
        ranges.push(last);
    return ranges;
}
/**
 * Called every time the document becomes active (`onDidChangeActiveTextEditor`)
 * for the mumps coverage  uri scheme.
 */
function setCoverageDecorations(textEditor) {
    const notCoveredLines = [];
    const coveredLines = [];
    const virtualMumps = mumps_1.getVirtualDocument(textEditor.document.uri);
    getRoutineCoverage(virtualMumps.uri).methods.forEach(coverageMethod => {
        const documentMethod = virtualMumps.parsedDocument.methods.find(method => {
            return method.id.value === coverageMethod.name;
        });
        if (!documentMethod)
            return;
        let lastIndicator;
        for (let lineNumber = 0; lineNumber < coverageMethod.coverageSequence.length; lineNumber++) {
            const indicator = coverageMethod.coverageSequence[lineNumber].indicator;
            if (!indicator || (indicator === CoverageIndicator.COMMENT && !lastIndicator)) {
                notCoveredLines.push(documentMethod.line + lineNumber);
                lastIndicator = 0;
            }
            else {
                coveredLines.push(documentMethod.line + lineNumber);
                lastIndicator = 1;
            }
        }
    });
    textEditor.setDecorations(notCovered, notCoveredLines.map(line => new vscode.Range(line, 0, line, Number.MAX_VALUE)));
    textEditor.setDecorations(covered, coveredLines.map(line => new vscode.Range(line, 0, line, Number.MAX_VALUE)));
}
/**
 * Parses the RPC output of a coverage run. Returns sanitized output and parsed coverage report.
 */
function parseCoverageOutput(input) {
    const parsed = {
        documents: [],
        output: input,
    };
    const begin = '#BeginCoverageInfo';
    const end = '#EndCoverageInfo';
    if (!input.includes(begin) && !input.includes(end)) {
        return parsed;
    }
    const split1 = input.split(begin);
    const split2 = split1[1].split(end);
    const output = split1[0] + split2[split2.length - 1];
    parsed.output = output;
    const routinesToPercentages = new Map();
    const match = output.match(/\d+\.\d+% - \w+/g);
    if (!match)
        return parsed;
    match.forEach(l => routinesToPercentages.set((l.split(' - ')[1]), l.split(' - ')[0]));
    parsed.documents = extractDocumentCoverage(split2[0], routinesToPercentages);
    return parsed;
}
exports.parseCoverageOutput = parseCoverageOutput;
function extractDocumentCoverage(codeOutput, routinesToPercentages) {
    const splitOutput = codeOutput.split(/\r?\n/).filter(x => x).map(x => x.trim());
    const documents = [];
    let documentCoverage = { coverage: '', methods: [], name: '' };
    const initialize = (routineName) => {
        documentCoverage = { name: routineName, methods: [], coverage: routinesToPercentages.get(routineName) || '' };
        documents.push(documentCoverage);
    };
    for (const line of splitOutput) {
        if (line.match(/^9\|.*/)) {
            initialize(line.split('|')[1]);
        }
        else if (line.match(/^1/)) {
            documentCoverage.methods.push({ name: line.split('|')[1], coverageSequence: line.split('|')[2].split('').map(s => ({ indicator: Number(s) })) });
        }
    }
    return documents;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNsVW5pdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaG9zdENvbW1hbmRzL3BzbFVuaXRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBRWpDLDZDQUFzRztBQUN0Ryx5REFBbUQ7QUFpQm5ELElBQUssaUJBSUo7QUFKRCxXQUFLLGlCQUFpQjtJQUNyQix1RUFBZSxDQUFBO0lBQ2YsK0RBQVcsQ0FBQTtJQUNYLCtEQUFXLENBQUE7QUFDWixDQUFDLEVBSkksaUJBQWlCLEtBQWpCLGlCQUFpQixRQUlyQjtBQWNELE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVyRixNQUFNLGNBQWMsR0FBRyw0QkFBb0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBRTdELFNBQVMsZ0JBQWdCLENBQUMsYUFBcUIsRUFBRSxRQUFnQjtJQUNoRSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsOEJBQThCLENBQUM7UUFDbkQsZUFBZSxFQUFFLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFDckQsV0FBVyxFQUFFLElBQUk7UUFDakIsa0JBQWtCLEVBQUUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNuRCxpQkFBaUIsRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSTtRQUNoRCxhQUFhLEVBQUUsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFVBQVU7S0FDeEQsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUNELE1BQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDLGtDQUFrQyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7QUFDL0csTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsbUNBQW1DLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztBQUUzRywrQkFBdUIsQ0FBQyxHQUFHLENBQUMs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