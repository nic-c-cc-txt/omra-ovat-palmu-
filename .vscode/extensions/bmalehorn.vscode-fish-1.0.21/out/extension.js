// Copyright (c) 2019-2020 Brian Malehorn
// Copyright (c) 2017 Sebastian Wiesner <sebastian@swsnr.de>
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
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
exports.activate = void 0;
const child_process_1 = require("child_process");
const vscode = require("vscode");
const vscode_1 = require("vscode");
/**
 * Activate this extension.
 *
 * Install a formatter for fish files using fish_indent, and start linting fish
 * files for syntax errors.
 *
 * Initialization fails if Fish is not installed.
 *
 * @param context The context for this extension
 * @return A promise for the initialization
 */
exports.activate = (context) => __awaiter(void 0, void 0, void 0, function* () {
    startLinting(context);
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider("fish", formattingProviders));
    context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider("fish", formattingProviders));
});
/**
 * Start linting Fish documents.
 *
 * @param context The extension context
 */
const startLinting = (context) => {
    const diagnostics = vscode.languages.createDiagnosticCollection("fish");
    context.subscriptions.push(diagnostics);
    const lint = (document) => __awaiter(void 0, void 0, void 0, function* () {
        if (isSavedFishDocument(document)) {
            const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
            try {
                const result = yield runInWorkspace(workspaceFolder, [
                    "fish",
                    "-n",
                    document.fileName,
                ]);
                var d = fishOutputToDiagnostics(document, result.stderr);
            }
            catch (error) {
                vscode.window.showErrorMessage(error.toString());
                diagnostics.delete(document.uri);
                return;
            }
            diagnostics.set(document.uri, d);
        }
    });
    vscode.workspace.onDidOpenTextDocument(lint, null, context.subscriptions);
    vscode.workspace.onDidSaveTextDocument(lint, null, context.subscriptions);
    vscode.workspace.textDocuments.forEach(lint);
    // Remove diagnostics for closed files
    vscode.workspace.onDidCloseTextDocument((d) => diagnostics.delete(d.uri), null, context.subscriptions);
};
/**
 * Parse fish errors from Fish output for a given document.
 *
 * @param document The document to whose contents errors refer
 * @param output The error output from Fish.
 * @return An array of all diagnostics
 */
const fishOutputToDiagnostics = (document, output) => {
    const diagnostics = [];
    const matches = getMatches(/^(.+) \(line (\d+)\): (.+)$/gm, output);
    for (const match of matches) {
        const lineNumber = Number.parseInt(match[2]);
        const message = match[3];
        const range = document.validateRange(new vscode_1.Range(lineNumber - 1, 0, lineNumber - 1, Number.MAX_VALUE));
        const diagnostic = new vscode_1.Diagnostic(range, message);
        diagnostic.source = "fish";
        diagnostics.push(diagnostic);
    }
    return diagnostics;
};
/**
 * Get text edits to format a range in a document.
 *
 * @param document The document whose text to format
 * @param range The range within the document to format
 * @return A promise with the list of edits
 */
const getFormatRangeEdits = (document, range) => __awaiter(void 0, void 0, void 0, function* () {
    const actualRange = document.validateRange(range || new vscode_1.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));
    try {
        var result = yield runInWorkspace(vscode.workspace.getWorkspaceFolder(document.uri), ["fish_indent"], document.getText(actualRange));
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to run fish_indent: ${error}`);
        // Re-throw the error to make the promise fail
        throw error;
    }
    return result.exitCode === 0
        ? [vscode_1.TextEdit.replace(actualRange, result.stdout)]
        : [];
});
/**
 * Formatting providers for fish documents.
 */
const formattingProviders = {
    provideDocumentFormattingEdits: (document, _, token) => getFormatRangeEdits(document).then((edits) => token.isCancellationRequested
        ? []
        : // tslint:disable-next-line:readonly-array
            edits),
    provideDocumentRangeFormattingEdits: (document, range, _, token) => getFormatRangeEdits(document, range).then((edits) => token.isCancellationRequested
        ? []
        : // tslint:disable-next-line:readonly-array
            edits),
};
/**
 * Whether a given document is saved to disk and in Fish language.
 *
 * @param document The document to check
 * @return Whether the document is a Fish document saved to disk
 */
const isSavedFishDocument = (document) => !document.isDirty &&
    0 <
        vscode.languages.match({
            language: "fish",
            scheme: "file",
        }, document);
/**
 * Whether an error is a system error.
 *
 * @param error The error to check
 */
const isSystemError = (error) => error.errno !== undefined &&
    typeof error.errno === "string";
/**
 * Whether an error is a process error.
 */
const isProcessError = (error) => !isSystemError(error) &&
    error.code !== undefined &&
    error.code > 0;
/**
 * Run a command in a given workspace folder.
 *
 * If the workspace folder is undefined run the command in the working directory
 * if the vscode instance.
 *
 * @param folder The folder to run the command in
 * @param command The command array
 * @param stdin An optional string to feed to standard input
 * @return The result of the process as promise
 */
const runInWorkspace = (folder, command, stdin) => new Promise((resolve, reject) => {
    const cwd = folder ? folder.uri.fsPath : process.cwd();
    const child = child_process_1.execFile(command[0], command.slice(1), { cwd }, (error, stdout, stderr) => {
        if (error && !isProcessError(error)) {
            // Throw system errors, but do not fail if the command
            // fails with a non-zero exit code.
            console.error("Command error", command, error);
            reject(error);
        }
        else {
            const exitCode = error ? error.code : 0;
            resolve({ stdout, stderr, exitCode });
        }
    });
    if (stdin) {
        child.stdin.end(stdin);
    }
});
/**
 * Exec pattern against the given text and return an array of all matches.
 *
 * @param pattern The pattern to match against
 * @param text The text to match the pattern against
 * @return All matches of pattern in text.
 */
const getMatches = (pattern, text) => {
    const results = [];
    // We need to loop through the regexp here, so a let is required
    let match = pattern.exec(text);
    while (match !== null) {
        results.push(match);
        match = pattern.exec(text);
    }
    return results;
};
//# sourceMappingURL=extension.js.map