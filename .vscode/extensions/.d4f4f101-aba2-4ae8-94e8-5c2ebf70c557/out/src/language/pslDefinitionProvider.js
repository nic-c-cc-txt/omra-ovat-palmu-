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
class PSLDefinitionProvider {
    provideDefinition(document, position, cancellationToknen) {
        return __awaiter(this, void 0, void 0, function* () {
            if (cancellationToknen.isCancellationRequested)
                return;
            let parsedDoc = parser.parseText(document.getText());
            // get tokens on line and current token
            let tokenSearchResults = utils.searchTokens(parsedDoc.tokens, position);
            if (!tokenSearchResults)
                return [];
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
                return getLocation(resolvedResult);
        });
    }
}
exports.PSLDefinitionProvider = PSLDefinitionProvider;
function getLocation(result) {
    if (!result.member) {
        return new vscode.Location(vscode.Uri.file(result.fsPath), new vscode.Position(0, 0));
    }
    let range = result.member.id.getRange();
    let vscodeRange = new vscode.Range(range.start.line, range.start.character, range.end.line, range.end.character);
    return new vscode.Location(vscode.Uri.file(result.fsPath), vscodeRange);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNsRGVmaW5pdGlvblByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbmd1YWdlL3BzbERlZmluaXRpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUNqQyw2Q0FBK0Q7QUFDL0QsMkNBQTJDO0FBQzNDLDZDQUE2QztBQUM3QywrQkFBK0I7QUFFL0IsTUFBYSxxQkFBcUI7SUFFM0IsaUJBQWlCLENBQUMsUUFBNkIsRUFBRSxRQUF5QixFQUFFLGtCQUE0Qzs7WUFDN0gsSUFBSSxrQkFBa0IsQ0FBQyx1QkFBdUI7Z0JBQUUsT0FBTztZQUN2RCxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRXJELHVDQUF1QztZQUN2QyxJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsa0JBQWtCO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ25DLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLEdBQUcsa0JBQWtCLENBQUM7WUFFakQsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM3RSxJQUFJLENBQUMsa0JBQWtCO2dCQUFFLE9BQU87WUFFaEMsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUQsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTztZQUNwQyxJQUFJLEtBQUssR0FBZ0IsdUJBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxRixJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUN4RixJQUFJLGNBQWMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUQsSUFBSSxjQUFjO2dCQUFFLE9BQU8sV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hELENBQUM7S0FBQTtDQUNEO0FBckJELHNEQXFCQztBQUVELFNBQVMsV0FBVyxDQUFDLE1BQTBCO0lBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ25CLE9BQU8sSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdEY7SUFDRCxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN4QyxJQUFJLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNqSCxPQUFPLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDekUsQ0FBQyJ9