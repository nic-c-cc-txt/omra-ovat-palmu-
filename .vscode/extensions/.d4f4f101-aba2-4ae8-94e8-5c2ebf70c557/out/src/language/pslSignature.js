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
const config_1 = require("../parser/config");
const parser = require("../parser/parser");
const utils = require("../parser/utilities");
const lang = require("./lang");
class PSLSignatureHelpProvider {
    provideSignatureHelp(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceDirectory = vscode.workspace.getWorkspaceFolder(document.uri);
            if (!workspaceDirectory)
                return;
            let parsedDoc = parser.parseText(document.getText());
            // get tokens on line and current token
            let tokenSearchResults = ((tokens, position) => {
                const tokensOnLine = tokens.filter(t => t.position.line === position.line);
                if (tokensOnLine.length === 0)
                    return undefined;
                const index = tokensOnLine.findIndex(t => {
                    const start = t.position;
                    const end = { line: t.position.line, character: t.position.character + t.value.length };
                    const isBetween = (lb, t, ub) => {
                        return lb.line <= t.line &&
                            lb.character <= t.character &&
                            ub.line >= t.line &&
                            ub.character >= t.character;
                    };
                    return isBetween(start, position, end);
                });
                return { tokensOnLine, index };
            })(parsedDoc.tokens, position);
            if (!tokenSearchResults)
                return;
            let { tokensOnLine, index } = tokenSearchResults;
            let { callTokens, parameterIndex } = utils.findCallable(tokensOnLine, index);
            if (callTokens.length === 0)
                return;
            let paths = config_1.getFinderPaths(workspaceDirectory.uri.fsPath, document.fileName);
            let finder = new utils.ParsedDocFinder(parsedDoc, paths, lang.getWorkspaceDocumentText);
            let resolvedResult = yield finder.resolveResult(callTokens);
            if (!resolvedResult.member || resolvedResult.member.memberClass !== parser.MemberClass.method)
                return;
            if (resolvedResult)
                return getSignature(resolvedResult, parameterIndex, finder);
        });
    }
}
exports.PSLSignatureHelpProvider = PSLSignatureHelpProvider;
function getSignature(result, parameterIndex, finder) {
    return __awaiter(this, void 0, void 0, function* () {
        let { code, markdown } = yield lang.getDocumentation(result, finder);
        let clean = markdown.replace(/\s*(DOC)?\s*\-+/, '').replace(/\*+\s+ENDDOC/, '').trim();
        clean = clean
            .split(/\r?\n/g).map(l => l.trim()).join('\n')
            .replace(/(@\w+)/g, '*$1*')
            .replace(/(\*(@(param|publicnew|public|throws?))\*)\s+([A-Za-z\-0-9%_\.]+)/g, '$1 `$4`');
        let method = result.member;
        let argString = method.parameters.map((param) => `${param.types[0].value} ${param.id.value}`).join(', ');
        code = `${method.id.value}(${argString})`;
        let info = new vscode.SignatureInformation(code, new vscode.MarkdownString().appendMarkdown(clean));
        info.parameters = method.parameters.map(parameter => new vscode.ParameterInformation(`${parameter.types[0].value} ${parameter.id.value}`));
        let signatureHelp = new vscode.SignatureHelp();
        signatureHelp.signatures = [info];
        signatureHelp.activeSignature = 0;
        signatureHelp.activeParameter = parameterIndex;
        return signatureHelp;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNsU2lnbmF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbmd1YWdlL3BzbFNpZ25hdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyw2Q0FBK0Q7QUFDL0QsMkNBQTJDO0FBRTNDLDZDQUE2QztBQUM3QywrQkFBK0I7QUFFL0IsTUFBYSx3QkFBd0I7SUFDdkIsb0JBQW9CLENBQUMsUUFBNkIsRUFBRSxRQUF5Qjs7WUFDekYsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsa0JBQWtCO2dCQUFFLE9BQU87WUFFaEMsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNyRCx1Q0FBdUM7WUFDdkMsSUFBSSxrQkFBa0IsR0FBRyxDQUFDLENBQUMsTUFBZSxFQUFFLFFBQWtCLEVBQUUsRUFBRTtnQkFDakUsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0UsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUM7b0JBQUUsT0FBTyxTQUFTLENBQUM7Z0JBQ2hELE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3hDLE1BQU0sS0FBSyxHQUFhLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQ25DLE1BQU0sR0FBRyxHQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxDQUFD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