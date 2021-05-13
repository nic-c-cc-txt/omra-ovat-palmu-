"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("../parser/utilities");
const api_1 = require("./api");
var Code;
(function (Code) {
    Code[Code["ONE_EMPTY_LINE"] = 1] = "ONE_EMPTY_LINE";
    Code[Code["TWO_EMPTY_LINES"] = 2] = "TWO_EMPTY_LINES";
})(Code = exports.Code || (exports.Code = {}));
/**
 * Checks if method has a documentation block below it.
 */
class MethodDocumentation extends api_1.MethodRule {
    report(method) {
        if (method.batch)
            return [];
        const diagnostics = [];
        if (!hasBlockComment(method, this.parsedDocument)) {
            const idToken = method.id;
            const message = `Documentation missing for label "${idToken.value}".`;
            diagnostics.push(addDiagnostic(idToken, method, message, this.ruleName));
        }
        return diagnostics;
    }
}
exports.MethodDocumentation = MethodDocumentation;
class MethodSeparator extends api_1.MethodRule {
    report(method) {
        if (method.batch)
            return [];
        const diagnostics = [];
        if (!hasSeparator(method, this.parsedDocument)) {
            const idToken = method.id;
            const message = `Separator missing for label "${idToken.value}".`;
            diagnostics.push(addDiagnostic(idToken, method, message, this.ruleName));
        }
        return diagnostics;
    }
}
exports.MethodSeparator = MethodSeparator;
class TwoEmptyLines extends api_1.MethodRule {
    report(method) {
        if (method.batch)
            return [];
        const diagnostics = [];
        const idToken = method.id;
        const lineAbove = hasSeparator(method, this.parsedDocument) ?
            method.id.position.line - 2 : method.id.position.line - 1;
        if (lineAbove < 2) {
            const message = `There should be two empty lines above label "${idToken.value}".`;
            return [addDiagnostic(idToken, method, message, this.ruleName, Code.TWO_EMPTY_LINES)];
        }
        const hasOneSpaceAbove = this.profileComponent.getTextAtLine(lineAbove).trim() === '';
        const hasTwoSpacesAbove = this.profileComponent.getTextAtLine(lineAbove - 1).trim() === '';
        const hasThreeSpacesAbove = this.profileComponent.getTextAtLine(lineAbove - 2).trim() === '';
        let code;
        if (!hasTwoSpacesAbove)
            code = Code.ONE_EMPTY_LINE;
        if (!hasOneSpaceAbove)
            code = Code.TWO_EMPTY_LINES;
        // Checks two empty lines above a method
        if (!hasOneSpaceAbove || !hasTwoSpacesAbove || lineAbove <= 0) {
            const message = `There should be two empty lines above label "${idToken.value}".`;
            diagnostics.push(addDiagnostic(idToken, method, message, this.ruleName, code));
        }
        // Check more than 2 empty lines above a method
        if (hasOneSpaceAbove && hasTwoSpacesAbove && hasThreeSpacesAbove) {
            const message = `There are more than two empty lines above label "${idToken.value}".`;
            diagnostics.push(addDiagnostic(idToken, method, message, this.ruleName, code));
        }
        return diagnostics;
    }
}
exports.TwoEmptyLines = TwoEmptyLines;
function addDiagnostic(idToken, method, message, ruleName, code) {
    const range = idToken.getRange();
    const diagnostic = new api_1.Diagnostic(range, message, ruleName, api_1.DiagnosticSeverity.Information);
    diagnostic.source = 'lint';
    diagnostic.member = method;
    if (code)
        diagnostic.code = code;
    return diagnostic;
}
function hasSeparator(method, parsedDocument) {
    const nextLineCommentTokens = utilities_1.getCommentsOnLine(parsedDocument, method.id.position.line - 1);
    return nextLineCommentTokens[0] && nextLineCommentTokens[0].isLineComment();
}
function hasBlockComment(method, parsedDocument) {
    const nextLineCommentTokens = utilities_1.getCommentsOnLine(parsedDocument, utilities_1.getLineAfter(method));
    return nextLineCommentTokens[0] && nextLineCommentTokens[0].isBlockComment();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0aG9kRG9jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BzbExpbnQvbWV0aG9kRG9jLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsbURBQXFFO0FBQ3JFLCtCQUFtRTtBQUVuRSxJQUFZLElBR1g7QUFIRCxXQUFZLElBQUk7SUFDZixtREFBa0IsQ0FBQTtJQUNsQixxREFBbUIsQ0FBQTtBQUNwQixDQUFDLEVBSFcsSUFBSSxHQUFKLFlBQUksS0FBSixZQUFJLFFBR2Y7QUFFRDs7R0FFRztBQUNILE1BQWEsbUJBQW9CLFNBQVEsZ0JBQVU7SUFFbEQsTUFBTSxDQUFDLE1BQWM7UUFFcEIsSUFBSSxNQUFNLENBQUMsS0FBSztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRTVCLE1BQU0sV0FBVyxHQUFpQixFQUFFLENBQUM7UUFFckMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ2xELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDMUIsTUFBTSxPQUFPLEdBQUcsb0NBQW9DLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQztZQUN0RSxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUN6RTtRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3BCLENBQUM7Q0FDRDtBQWhCRCxrREFnQkM7QUFDRCxNQUFhLGVBQWdCLFNBQVEsZ0JBQVU7SUFFOUMsTUFBTSxDQUFDLE1BQWM7UUFFcEIsSUFBSSxNQUFNLENBQUMsS0FBSztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRTVCLE1BQU0sV0FBVyxHQUFpQixFQUFFLENBQUM7UUFFckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQy9DLE1B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