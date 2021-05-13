"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const tokenizer_1 = require("./../parser/tokenizer");
var DiagnosticSeverity;
(function (DiagnosticSeverity) {
    /**
     * Something not allowed by the rules of a language or other means.
     */
    DiagnosticSeverity[DiagnosticSeverity["Error"] = 0] = "Error";
    /**
     * Something suspicious but allowed.
     */
    DiagnosticSeverity[DiagnosticSeverity["Warning"] = 1] = "Warning";
    /**
     * Something to inform about but not a problem.
     */
    DiagnosticSeverity[DiagnosticSeverity["Information"] = 2] = "Information";
    /**
     * Something to hint to a better way of doing it, like proposing
     * a refactoring.
     */
    DiagnosticSeverity[DiagnosticSeverity["Hint"] = 3] = "Hint";
})(DiagnosticSeverity = exports.DiagnosticSeverity || (exports.DiagnosticSeverity = {}));
class Diagnostic {
    /**
     * Creates a new diagnostic object.
     *
     * @param range The range to which this diagnostic applies.
     * @param message The human-readable message.
     * @param severity The severity, default is [error](#DiagnosticSeverity.Error).
     */
    constructor(range, message, ruleName, severity, member) {
        this.range = range;
        this.message = message;
        this.ruleName = ruleName;
        if (severity)
            this.severity = severity;
        if (member)
            this.member = member;
    }
}
exports.Diagnostic = Diagnostic;
/**
 * Represents a related message and source code location for a diagnostic. This should be
 * used to point to code locations that cause or related to a diagnostics, e.g when duplicating
 * a symbol in a scope.
 */
class DiagnosticRelatedInformation {
    /**
     * Creates a new related diagnostic information object.
     *
     * @param range The range.
     * @param message The message.
     */
    constructor(range, message) {
        this.range = range;
        this.message = message;
    }
}
exports.DiagnosticRelatedInformation = DiagnosticRelatedInformation;
class ProfileComponentRule {
    constructor() {
        this.ruleName = this.constructor.name;
    }
}
exports.ProfileComponentRule = ProfileComponentRule;
class FileDefinitionRule extends ProfileComponentRule {
}
exports.FileDefinitionRule = FileDefinitionRule;
class PslRule extends ProfileComponentRule {
}
exports.PslRule = PslRule;
class MemberRule extends PslRule {
}
exports.MemberRule = MemberRule;
class PropertyRule extends PslRule {
}
exports.PropertyRule = PropertyRule;
class MethodRule extends PslRule {
}
exports.MethodRule = MethodRule;
class ParameterRule extends PslRule {
}
exports.ParameterRule = ParameterRule;
class DeclarationRule extends PslRule {
}
exports.DeclarationRule = DeclarationRule;
/**
 * A ProfileComponent contains information about a file used in Profile.
 * The file may be PSL or non-PSL (such as a TBL or COL).
 */
class ProfileComponent {
    constructor(fsPath, textDocument, getTextAtLine) {
        this.textDocument = textDocument;
        this.fsPath = fsPath;
        if (getTextAtLine)
            this.getTextAtLine = getTextAtLine;
    }
    static isPsl(fsPath) {
        return path.extname(fsPath) === '.PROC'
            || path.extname(fsPath) === '.BATCH'
            || path.extname(fsPath) === '.TRIG'
            || path.extname(fsPath).toUpperCase() === '.PSL';
    }
    static isFileDefinition(fsPath) {
        return path.extname(fsPath) === '.TBL'
            || path.extname(fsPath) === '.COL';
    }
    static isProfileComponent(fsPath) {
        return ProfileComponent.isPsl(fsPath)
            || ProfileComponent.isFileDefinition(fsPath);
    }
    /**
     * A utility method to get the text at a specified line of the document.
     * @param lineNumber The zero-based line number of the document where the text is.
     */
    getTextAtLine(lineNumber) {
        if (lineNumber < 0) {
            throw new Error('Cannot get text at negative line number.');
        }
        if (!this.indexedDocument) {
            this.indexedDocument = this.createIndexedDocument();
        }
        return this.indexedDocument.get(lineNumber) || '';
    }
    /**
     * Converts a zero-based offset to a position.
     *
     * @param offset A zero-based offset.
     * @return A valid [position](#Position).
     */
    positionAt(offset) {
        const before = this.textDocument.slice(0, offset);
        const newLines = before.match(/\n/g);
        const line = newLines ? newLines.length : 0;
        const preCharacters = before.match(/(\n|^).*$/g);
        return new tokenizer_1.Position(line, preCharacters ? preCharacters[0].length : 0);
    }
    createIndexedDocument() {
        const indexedDocument = new Map();
        let line = '';
        let index = 0;
        for (const char of this.textDocument) {
            line += char;
            if (char === '\n') {
                indexedDocument.set(index, line);
                index++;
                line = '';
            }
        }
        return indexedDocument;
    }
}
exports.ProfileComponent = ProfileComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BzbExpbnQvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBRTdCLHFEQUF3RDtBQUV4RCxJQUFZLGtCQXNCWDtBQXRCRCxXQUFZLGtCQUFrQjtJQUU3Qjs7T0FFRztJQUNILDZEQUFTLENBQUE7SUFFVDs7T0FFRztJQUNILGlFQUFXLENBQUE7SUFFWDs7T0FFRztJQUNILHlFQUFlLENBQUE7SUFFZjs7O09BR0c7SUFDSCwyREFBUSxDQUFBO0FBQ1QsQ0FBQyxFQXRCVyxrQkFBa0IsR0FBbEIsMEJBQWtCLEtBQWxCLDBCQUFrQixRQXNCN0I7QUFFRCxNQUFhLFVBQVU7SUF3Q3RCOzs7Ozs7T0FNRztJQUNILFlBQVksS0FBWSxFQUFFLE9BQWUsRUFBRSxRQUFnQixFQUFFLFFBQTZCLEVBQUUsTUFBZTtRQUMxRyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLFFBQVE7WUFBRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN2QyxJQUFJLE1BQU07WUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUNsQyxDQUFDO0NBQ0Q7QUF0REQsZ0NBc0RDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQWEsNEJBQTRCO0lBWXhDOzs7OztPQUtHO0lBQ0gsWUFBWSxLQUFZLEVBQUUsT0FBZTtRQUN4QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN4QixDQUFDO0NBQ0Q7QUF0QkQsb0VBc0JDO0FBRUQsTUFBc0Isb0JBQW9CO0lBQTFDO1FBRVUsYUFBUSxHQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDO0lBS25ELENBQUM7Q0FBQTtBQVBELG9EQU9DO0FBRUQsTUFBc0Isa0JBQW1CLFNBQVEsb0JBQW9CO0NBQUk7QUFBekUsZ0RBQXlFO0FBRXpFLE1BQXNCLE9BQVEsU0FBUSxvQkFBb0I7Q0FLekQ7QUFMRCwwQkFLQztBQUVELE1BQXNCLFVBQVcsU0FBUSxPQUFPO0NBRS9DO0FBRkQsZ0NBRUM7QUFFRCxNQUFzQixZQUFhLFNBQVEsT0FBTztDQUVqRDtBQUZELG9DQUVDO0FBRUQsTUFBc0IsVUFBVyxTQUFRLE9BQU87Q0FFL0M7QUFGRCxnQ0FFQztBQUVELE1BQXNCLGFBQWMsU0FBUSxPQUFPO0NBRWxEO0FBRkQsc0NBRUM7QUFFRCxNQUFzQixlQUFnQixTQUFRLE9BQU87Q0FFcEQ7QUFGRCwwQ0FFQztBQUlEOzs7R0FHRztBQUNILE1BQWEsZ0JBQWdCO0lBd0I1QixZQUFZLE1BQWMsRUFBRSxZQUFvQixFQUFFLGFBQTZCO1FBQzlFLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksYUFBYTtZQUFFLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3ZELENBQUM7SUExQkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFjO1FBQzFCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxPQUFPO2VBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssUUFBUTtlQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLE9BQU87ZUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLENBQUM7SUFDbkQsQ0FBQztJQUVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFjO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxNQUFNO2VBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssTUFBTSxDQUFDO0lBQ3JDLENBQUM7SUFFRCxNQUFNLENBQUMsa0JBQWtCLENBQUMsTUFBYztRQUN2QyxPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7ZUFDakMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQWFEOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxVQUFrQjtRQUMvQixJQUFJLFVBQVUsR0FBRyxDQUFDLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1NBQzVEO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztTQUNwRDtRQUNELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFVBQVUsQ0FBQyxNQUFjO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDakQsT0FBTyxJQUFJLG9CQUFRLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVPLHFCQUFxQjtRQUM1QixNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2xDLElBQUksSUFBSSxHQUFXLEVBQUUsQ0FBQztRQUN0QixJQUFJLEtBQUssR0FBVyxDQUFDLENBQUM7UUFDdEIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3JDLElBQUksSUFBSSxJQUFJLENBQUM7WUFDYixJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqQyxLQUFLLEVBQUUsQ0FBQztnQkFDUixJQUFJLEdBQUcsRUFBRSxDQUFDO2FBQ1Y7U0FDRDtRQUNELE9BQU8sZUFBZSxDQUFDO0lBQ3hCLENBQUM7Q0FDRDtBQXhFRCw0Q0F3RUMifQ==