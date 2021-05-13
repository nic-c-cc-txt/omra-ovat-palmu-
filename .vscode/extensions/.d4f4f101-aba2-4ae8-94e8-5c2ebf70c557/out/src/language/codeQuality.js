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
const extension_1 = require("../extension");
const parser = require("../parser/parser");
const activate_1 = require("../pslLint/activate");
const api = require("../pslLint/api");
const config_1 = require("../pslLint/config");
const codeAction_1 = require("./codeAction");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pslLintConfigurationWatchers(context);
        const lintDiagnostics = vscode.languages.createDiagnosticCollection('psl-lint');
        context.subscriptions.push(lintDiagnostics);
        // initial token
        let tokenSource = new vscode.CancellationTokenSource();
        if (vscode.window.activeTextEditor) {
            prepareRules(vscode.window.activeTextEditor.document, lintDiagnostics, tokenSource.token);
        }
        vscode.window.onDidChangeActiveTextEditor(e => {
            if (!e)
                return;
            prepareRules(e.document, lintDiagnostics, tokenSource.token);
        });
        vscode.workspace.onDidChangeTextDocument(e => {
            if (!e)
                return;
            tokenSource.cancel();
            tokenSource = new vscode.CancellationTokenSource();
            prepareRules(e.document, lintDiagnostics, tokenSource.token);
        });
        vscode.workspace.onDidCloseTextDocument(closedDocument => {
            lintDiagnostics.delete(closedDocument.uri);
        });
        const actionProvider = new codeAction_1.PSLActionProvider();
        for (const mode of [extension_1.PSL_MODE, extension_1.BATCH_MODE, extension_1.TRIG_MODE]) {
            context.subscriptions.push(vscode.languages.registerCodeActionsProvider(mode, actionProvider));
        }
    });
}
exports.activate = activate;
function pslLintConfigurationWatchers(context) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all(vscode.workspace.workspaceFolders
            .map(workspace => new vscode.RelativePattern(workspace, 'psl-lint.json'))
            .map((pattern) => __awaiter(this, void 0, void 0, function* () {
            const watcher = vscode.workspace.createFileSystemWatcher(pattern);
            context.subscriptions.push(watcher.onDidChange(uri => {
                config_1.setConfig(uri.fsPath);
            }), watcher.onDidCreate(uri => {
                config_1.setConfig(uri.fsPath);
            }));
            watcher.onDidDelete(uri => {
                config_1.removeConfig(uri.fsPath);
            });
            const uris = yield vscode.workspace.findFiles(pattern);
            if (!uris.length)
                return;
            yield config_1.setConfig(uris[0].fsPath);
        })));
    });
}
class MemberDiagnostic extends vscode.Diagnostic {
}
exports.MemberDiagnostic = MemberDiagnostic;
function prepareRules(textDocument, lintDiagnostics, cancellationToken) {
    if (!api.ProfileComponent.isProfileComponent(textDocument.fileName))
        return;
    const lintConfigValue = vscode.workspace.getConfiguration('psl', textDocument.uri).get('lint');
    let useConfig = false;
    if (lintConfigValue === 'config') {
        // check if config exist first
        const config = config_1.getConfig(textDocument.uri.fsPath);
        if (!config)
            return;
        useConfig = true;
    }
    else if (lintConfigValue !== 'all' && lintConfigValue !== true) {
        lintDiagnostics.clear();
        return;
    }
    process.nextTick(() => {
        if (!cancellationToken.isCancellationRequested) {
            lint(textDocument, useConfig, cancellationToken, lintDiagnostics);
        }
    });
}
function lint(textDocument, useConfig, cancellationToken, lintDiagnostics) {
    const profileComponent = prepareDocument(textDocument);
    const parsedDocument = api.ProfileComponent.isPsl(profileComponent.fsPath) ?
        parser.parseText(textDocument.getText()) : undefined;
    const diagnostics = activate_1.getDiagnostics(profileComponent, parsedDocument, useConfig);
    const memberDiagnostics = transform(diagnostics, textDocument.uri);
    process.nextTick(() => {
        if (!cancellationToken.isCancellationRequested) {
            lintDiagnostics.set(textDocument.uri, memberDiagnostics);
        }
    });
}
function prepareDocument(textDocument) {
    const getTextAtLine = (n) => textDocument.lineAt(n).text;
    const profileComponent = new api.ProfileComponent(textDocument.uri.fsPath, textDocument.getText(), getTextAtLine);
    return profileComponent;
}
function transform(diagnostics, uri) {
    return diagnostics.map(pslLintDiagnostic => {
        const r = pslLintDiagnostic.range;
        const vscodeRange = new vscode.Range(r.start.line, r.start.character, r.end.line, r.end.character);
        const memberDiagnostic = new MemberDiagnostic(vscodeRange, pslLintDiagnostic.message, pslLintDiagnostic.severity);
        memberDiagnostic.source = pslLintDiagnostic.source;
        memberDiagnostic.code = pslLintDiagnostic.code;
        memberDiagnostic.ruleName = pslLintDiagnostic.ruleName;
        if (pslLintDiagnostic.member)
            memberDiagnostic.member = pslLintDiagnostic.member;
        if (pslLintDiagnostic.relatedInformation) {
            memberDiagnostic.relatedInformation = pslLintDiagnostic.relatedInformation.map(x => {
                return new vscode.DiagnosticRelatedInformation(new vscode.Location(uri, new vscode.Range(x.range.start.line, x.range.start.character, x.range.end.line, x.range.end.character)), x.message);
            });
        }
        return memberDiagnostic;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZVF1YWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFuZ3VhZ2UvY29kZVF1YWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBaUM7QUFDakMsNENBQStEO0FBQy9ELDJDQUEyQztBQUMzQyxrREFBcUQ7QUFDckQsc0NBQXNDO0FBQ3RDLDhDQUF1RTtBQUN2RSw2Q0FBaUQ7QUFJakQsU0FBc0IsUUFBUSxDQUFDLE9BQWdDOztRQUU5RCxNQUFNLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTVDLE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEYsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFNUMsZ0JBQWdCO1FBQ2hCLElBQUksV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFFdkQsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFO1lBQ25DLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzFGO1FBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUM3QyxJQUFJLENBQUMsQ0FBQztnQkFBRSxPQUFPO1lBQ2YsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDNUMsSUFBSSxDQUFDLENBQUM7Z0JBQUUsT0FBTztZQUNmLFdBQVcsQ0FBQyxNQUFN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