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
const utilities_1 = require("../parser/utilities");
const methodDoc_1 = require("../pslLint/methodDoc");
function initializeAction(title, ...diagnostics) {
    const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    action.edit = new vscode.WorkspaceEdit();
    if (diagnostics)
        action.diagnostics = diagnostics;
    return action;
}
class PSLActionProvider {
    provideCodeActions(document, _range, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.diagnostics.length === 0)
                return;
            const newLine = document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n';
            const actions = [];
            const allDiagnostics = [];
            const allTextEdits = [];
            const fixAll = initializeAction('Fix all.');
            for (const diagnostic of context.diagnostics) {
                if (!diagnostic.member)
                    continue;
                const method = diagnostic.member;
                if (diagnostic.ruleName === methodDoc_1.MethodSeparator.name) {
                    const separatorAction = initializeAction('Add separator.', diagnostic);
                    const textEdit = vscode.TextEdit.insert(new vscode.Position(method.id.position.line - 1, Number.MAX_VALUE), `${newLine}\t// ---------------------------------------------------------------------`);
                    separatorAction.edit.set(document.uri, [textEdit]);
                    actions.push(separatorAction);
                    allDiagnostics.push(diagnostic);
                    allTextEdits.push({ edit: textEdit, priority: 2 });
                }
                if (diagnostic.ruleName === methodDoc_1.MethodDocumentation.name) {
                    const documentationAction = initializeAction('Add documentation block.', diagnostic);
                    let docText = `\t/* DOC -----------------------------------------------------------------${newLine}\t`
                        + `TODO: description of label ${method.id.value}${newLine}${newLine}`;
                    const terminator = `\t** ENDDOC */${newLine}`;
                    if (method.parameters.length > 0) {
                        const spacing = method.parameters.slice().sort((p1, p2) => {
                            return p2.id.value.length - p1.id.value.length;
                        })[0].id.value.length + 2;
                        docText += method.parameters.map(p => {
                            return `\t@param ${p.id.value}${' '.repeat(spacing - p.id.value.length)}TODO: description of param ${p.id.value}`;
                        }).join(`${newLine}${newLine}`) + `${newLine}`;
                    }
                    docText += terminator;
                    const textEdit = vscode.TextEdit.insert(new vscode.Position(utilities_1.getLineAfter(method), 0), docText);
                    documentationAction.edit.set(document.uri, [textEdit]);
                    actions.push(documentationAction);
                    allDiagnostics.push(diagnostic);
                    allTextEdits.push({ edit: textEdit, priority: 2 });
                }
            }
            if (actions.length > 1) {
                fixAll.edit.set(document.uri, allTextEdits.sort((a, b) => a.priority - b.priority).map(edits => edits.edit));
                fixAll.diagnostics = allDiagnostics;
                actions.push(fixAll);
            }
            return actions;
        });
    }
}
exports.PSLActionProvider = PSLActionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW5ndWFnZS9jb2RlQWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBR2pDLG1EQUFtRDtBQUNuRCxvREFBNEU7QUFFNUUsU0FBUyxnQkFBZ0IsQ0FBQyxLQUFhLEVBQUUsR0FBRyxXQUErQjtJQUMxRSxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUUsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN6QyxJQUFJLFdBQVc7UUFBRSxNQUFNLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNsRCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUM7QUFNRCxNQUFhLGlCQUFpQjtJQUNoQixrQkFBa0IsQ0FDOUIsUUFBNkIsRUFDN0IsTUFBb0IsRUFDcEIsT0FBaUM7O1lBR2pDLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBRTdDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEtBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3JFLE1BQU0sT0FBTyxHQUF3QixFQUFFLENBQUM7WUFDeEMsTUFBTSxjQUFjLEdBQXVCLEVBQUUsQ0FBQztZQUM5QyxNQUFNLFlBQVksR0FBdUQsRUFBRSxDQUFDO1lBRTVFLE1BQU0sTUFBTSxHQUFzQixnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUvRCxLQUFLLE1BQU0sVUFBVSxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxVQUFVLENBQUMs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