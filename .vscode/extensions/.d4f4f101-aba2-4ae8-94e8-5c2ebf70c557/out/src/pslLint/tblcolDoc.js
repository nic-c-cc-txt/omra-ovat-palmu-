"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const tokenizer_1 = require("../parser/tokenizer");
const api_1 = require("./api");
/**
 * Checks whether table and columns are created with documentation.
 */
class TblColDocumentation extends api_1.FileDefinitionRule {
    report() {
        const baseName = path.basename(this.profileComponent.fsPath);
        const diagnostics = [];
        const bracketMatch = this.profileComponent.textDocument.match(/^}/m);
        // Exit if no match found
        if (!bracketMatch)
            return [];
        const charcterOffset = bracketMatch.index;
        const endPos = this.profileComponent.textDocument.length;
        const tblColDoc = this.profileComponent.textDocument.substring(charcterOffset + 1, endPos).trim();
        if (!tblColDoc) {
            let message;
            if (baseName.endsWith('TBL')) {
                message = `Documentation missing for table definition "${baseName}".`;
            }
            else
                message = `Documentation missing for data item "${baseName}".`;
            const position = this.profileComponent.positionAt(charcterOffset);
            const range = new tokenizer_1.Range(position, position);
            diagnostics.push(addDiagnostic(range, message, this.ruleName));
        }
        return diagnostics;
    }
}
exports.TblColDocumentation = TblColDocumentation;
function addDiagnostic(range, message, ruleName) {
    const diagnostic = new api_1.Diagnostic(range, message, ruleName, api_1.DiagnosticSeverity.Information);
    diagnostic.source = 'lint';
    return diagnostic;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGJsY29sRG9jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BzbExpbnQvdGJsY29sRG9jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLG1EQUE0QztBQUM1QywrQkFBMkU7QUFFM0U7O0dBRUc7QUFDSCxNQUFhLG1CQUFvQixTQUFRLHdCQUFrQjtJQUUxRCxNQUFNO1FBQ0wsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFN0QsTUFBTSxXQUFXLEdBQWlCLEVBQUUsQ0FBQztRQUNyQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyRSx5QkFBeUI7UUFDekIsSUFBSSxDQUFDLFlBQVk7WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUU3QixNQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQ3pELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFbEcsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNmLElBQUksT0FBTyxDQUFDO1lBRVosSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM3QixPQUFPLEdBQUcsK0NBQStDLFFBQVEsSUFBSSxDQUFDO2FBQ3RFOztnQkFDSSxPQUFPLEdBQUcsd0NBQXdDLFFBQVEsSUFBSSxDQUFDO1lBQ3BFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDbEUsTUFBTSxLQUFLLEdBQUcsSUFBSSxpQkFBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM1QyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQy9EO1FBRUQsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztDQUVEO0FBN0JELGtEQTZCQztBQUVELFNBQVMsYUFBYSxDQUFDLEtBQVksRUFBRSxPQUFlLEVBQUUsUUFBZ0I7SUFDckUsTUFBTSxVQUFVLEdBQUcsSUFBSSxnQkFBVSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLHdCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzVGLFVBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQzNCLE9BQU8sVUFBVSxDQUFDO0FBQ25CLENBQUMifQ==