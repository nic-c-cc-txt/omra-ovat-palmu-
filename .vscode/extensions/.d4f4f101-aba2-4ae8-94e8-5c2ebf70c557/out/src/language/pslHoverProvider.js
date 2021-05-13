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
class PSLHoverProvider {
    provideHover(document, position, cancellationToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (cancellationToken.isCancellationRequested)
                return;
            let parsedDoc = parser.parseText(document.getText());
            // get tokens on line and current token
            let tokenSearchResults = utils.searchTokens(parsedDoc.tokens, position);
            if (!tokenSearchResults)
                return;
            let { tokensOnLine, index } = tokenSearchResults;
            const workspaceDirectory = vscode.workspace.getWorkspaceFolder(document.uri);
            if (!workspaceDirectory)
                return;
            let callTokens = utils.getCallTokens(tokensOnLine, index);
            if (callTokens.length === 0)
                return;
            let paths = config_1.getFinderPaths(workspaceDirectory.uri.fsPath, document.fileName);
            let finder = new utils.ParsedDocFinder(parsedDoc, paths, lang.getWorkspaceDocumentText);
            let resolvedResult = yield finder.resolveResult(callTokens);
            if (resolvedResult)
                return getHover(resolvedResult, finder);
        });
    }
}
exports.PSLHoverProvider = PSLHoverProvider;
function getHover(result, finder) {
    return __awaiter(this, void 0, void 0, function* () {
        let { code, markdown } = yield lang.getDocumentation(result, finder);
        let clean = markdown.replace(/\s*(DOC)?\s*\-+/, '').replace(/\*+\s+ENDDOC/, '').trim();
        clean = clean
            .split(/\r?\n/g).map(l => l.trim()).join('\n')
            .replace(/(@\w+)/g, '*$1*')
            .replace(/(\*(@(param|publicnew|public|throws?))\*)\s+([A-Za-z\-0-9%_\.]+)/g, '$1 `$4`');
        return new vscode.Hover([new vscode.MarkdownString().appendCodeblock(code), new vscode.MarkdownString().appendMarkdown(clean)]);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNsSG92ZXJQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW5ndWFnZS9wc2xIb3ZlclByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLDZDQUErRDtBQUMvRCwyQ0FBMkM7QUFDM0MsNkNBQTZDO0FBQzdDLCtCQUErQjtBQUUvQixNQUFhLGdCQUFnQjtJQUV0QixZQUFZLENBQUMsUUFBNkIsRUFBRSxRQUF5QixFQUFFLGlCQUEyQzs7WUFDdkgsSUFBSSxpQkFBaUIsQ0FBQyx1QkFBdUI7Z0JBQUUsT0FBTztZQUN0RCxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRXJELHVDQUF1QztZQUN2QyxJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsa0JBQWtCO2dCQUFFLE9BQU87WUFDaEMsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQztZQUVqRCxNQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxrQkFBa0I7Z0JBQUUsT0FBTztZQUVoQyxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxRCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBQ3BDLElBQUksS0FBSyxHQUFnQix1QkFBYyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFGLElBQUksTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ3hGLElBQUksY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM1RCxJQUFJLGNBQWM7Z0JBQUUsT0FBTyxRQUFRLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdELENBQUM7S0FBQTtDQUNEO0FBckJELDRDQXFCQztBQUVELFNBQWUsUUFBUSxDQUFDLE1BQTBCLEVBQUUsTUFBNkI7O1FBQ2hGLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXJFLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2RixLQUFLLEdBQUcsS0FBSzthQUNYLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQzdDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDO2FBQzFCLE9BQU8sQ0FBQyxtRUFBbUUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUUxRixPQUFPLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pJLENBQUM7Q0FBQSJ9