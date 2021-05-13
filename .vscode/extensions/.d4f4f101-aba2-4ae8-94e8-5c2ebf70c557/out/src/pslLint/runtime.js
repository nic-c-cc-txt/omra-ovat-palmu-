"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../parser/parser");
const statementParser_1 = require("../parser/statementParser");
const tokenizer_1 = require("../parser/tokenizer");
const utilities_1 = require("../parser/utilities");
const api_1 = require("./api");
class RuntimeStart extends api_1.MethodRule {
    report(method) {
        const runtimeCalls = [];
        method.statements.filter(statement => {
            return statement.action.value === 'do';
        }).forEach(statement => {
            statement.expressions.forEach(expression => {
                const dotOperator = expression;
                const classIdentifier = this.getClass(dotOperator);
                if (!classIdentifier)
                    return;
                if (classIdentifier.id.value === 'Runtime')
                    runtimeCalls.push(dotOperator);
            });
        });
        if (!runtimeCalls.length)
            return [];
        const diagnostics = [];
        this.tpFence(diagnostics, runtimeCalls, method);
        return diagnostics;
    }
    getClass(dotOperator) {
        if (dotOperator.kind !== statementParser_1.SyntaxKind.BINARY_OPERATOR)
            return;
        if (Array.isArray(dotOperator.left))
            return;
        if (!dotOperator.left || dotOperator.left.kind === statementParser_1.SyntaxKind.BINARY_OPERATOR)
            return;
        return dotOperator.left;
    }
    getMethod(dotOperator) {
        if (dotOperator.kind !== statementParser_1.SyntaxKind.BINARY_OPERATOR)
            return;
        return dotOperator.right;
    }
    tpFence(diagnostics, runtimeCalls, method) {
        let lastStart;
        let variables;
        let acceptVariables = [];
        for (const runtimeCall of runtimeCalls) {
            const runtimeMethod = this.getMethod(runtimeCall);
            if (runtimeMethod.id.value === 'start') {
                if (lastStart) {
                    variables.forEach((identifiers, variable) => {
                        this.createDiagnostic(lastStart, variable, identifiers, diagnostics);
                    });
                }
                lastStart = runtimeMethod;
                variables = new Map();
                acceptVariables = this.addToWhitelist(runtimeMethod);
            }
            else if (runtimeMethod.id.value === 'commit') {
                if (!lastStart)
                    continue;
                else {
                    const startLine = lastStart.id.position.line;
                    const commitLine = runtimeMethod.id.position.line;
                    const identifierTokens = this.getAllIdentifersInRange(this.parsedDocument.tokens, startLine, commitLine);
                    const variablesOutsideStart = method.declarations.concat(method.parameters)
                        .filter(variable => {
                        return variable.id.position.line <= startLine && acceptVariables.indexOf(variable.id.value) === -1;
                    });
                    for (const token of identifierTokens) {
                        this.addVariable(variablesOutsideStart, token, lastStart, variables);
                    }
                }
            }
        }
        if (variables) {
            variables.forEach((identifiers, variable) => {
                this.createDiagnostic(lastStart, variable, identifiers, diagnostics);
            });
        }
    }
    getAllIdentifersInRange(tokens, startLine, commitLine) {
        return tokens.filter(token => {
            return token.position.line > startLine && token.position.line < commitLine;
        });
    }
    createDiagnostic(lastStart, variable, identifiers, diagnostics) {
        const range = this.getDiagnosticRange(lastStart);
        const word = variable.memberClass === parser_1.MemberClass.parameter ? 'Parameter' : 'Declaration';
        const diag = new api_1.Diagnostic(range, `${word} "${variable.id.value}" referenced inside Runtime.start but not in variable list.`, this.ruleName, api_1.DiagnosticSeverity.Warning, variable);
        const relatedSource = new api_1.DiagnosticRelatedInformation(variable.id.getRange(), `Source of "${variable.id.value}"`);
        const relatedReferences = identifiers.map(i => {
            return new api_1.DiagnosticRelatedInformation(i.getRange(), `Reference to "${i.value}"`);
        });
        diag.relatedInformation = [
            relatedSource,
            ...relatedReferences,
        ];
        diag.source = 'tpfence';
        diagnostics.push(diag);
    }
    addVariable(localVariablesOutsideStart, identifierToken, start, variables) {
        const variable = localVariablesOutsideStart.find(v => v.id.value === identifierToken.value);
        if (variable
            && variable.id !== variable.types[0]
            && variable.modifiers.map(m => m.value).indexOf('literal') === -1) { // no static and literal
            const varList = start.args[1];
            if (!varList || varList.id.value.split(',').indexOf(variable.id.value) === -1) {
                const tokens = variables.get(variable);
                if (!tokens) {
                    variables.set(variable, [identifierToken]);
                }
                else if (tokens.indexOf(identifierToken) === -1) {
                    variables.set(variable, tokens.concat([identifierToken]));
                }
            }
        }
    }
    getDiagnosticRange(start) {
        const startPos = start.id.position.character - 'do Runtime.'.length;
        const endPos = start.closeParen.position.character + 1;
        return new tokenizer_1.Range(start.id.position.line, startPos, start.id.position.line, endPos);
    }
    addToWhitelist(runtimeMethod) {
        let acceptVariables = [];
        const commentsAbove = utilities_1.getCommentsOnLine(this.parsedDocument, runtimeMethod.id.position.line - 1);
        const whiteListComment = commentsAbove[0];
        if (!whiteListComment || !whiteListComment.isLineComment())
            return [];
        const comment = whiteListComment.value.trim();
        if (!comment.startsWith('@psl-lint.RuntimeStart'))
            return [];
        const args = comment.replace(/^@psl-lint\.RuntimeStart\s+/, '').split('=');
        for (let i = 0; i < args.length; i += 2) {
            const arg = args[i];
            const value = args[i + 1];
            if (arg === 'accept' && value) {
                const strippedValue = value.replace(/"/g, '');
                acceptVariables = strippedValue.split(',');
            }
        }
        return acceptVariables;
    }
}
exports.RuntimeStart = RuntimeStart;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wc2xMaW50L3J1bnRpbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBK0Q7QUFDL0QsK0RBR21DO0FBQ25DLG1EQUFtRDtBQUNuRCxtREFBd0Q7QUFDeEQsK0JBQWlHO0FBRWpHLE1BQWEsWUFBYSxTQUFRLGdCQUFVO0lBRTNDLE1BQU0sQ0FBQyxNQUFjO1FBRXBCLE1BQU0sWUFBWSxHQUFxQixFQUFFLENBQUM7UUFFMUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDcEMsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3RCLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUMxQyxNQUFNLFdBQVcsR0FBRyxVQUE0QixDQUFDO2dCQUNqRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsZUFBZTtvQkFBRSxPQUFPO2dCQUM3QixJQUFJLGVBQWUsQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLFNBQVM7b0JBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM1RSxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFFcEMsTUFBTSxXQUFXLEdBQWlCLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEQsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQUVELFFBQVEs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