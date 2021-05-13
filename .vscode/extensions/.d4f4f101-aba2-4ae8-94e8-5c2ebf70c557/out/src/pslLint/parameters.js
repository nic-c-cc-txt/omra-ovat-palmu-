"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
/**
 * Checks if multiple parameters are written on the same line as the method declaration.
 */
class MethodParametersOnNewLine extends api_1.MethodRule {
    report(method) {
        if (method.batch)
            return [];
        const diagnostics = [];
        const methodLine = method.id.position.line;
        let previousParam;
        for (const param of method.parameters) {
            const paramPosition = param.id.position;
            if (previousParam && paramPosition.line === previousParam.id.position.line) {
                const message = `Parameter "${param.id.value}" on same line as parameter "${previousParam.id.value}".`;
                const diagnostic = new api_1.Diagnostic(param.id.getRange(), message, this.ruleName, api_1.DiagnosticSeverity.Warning);
                diagnostic.source = 'lint';
                diagnostics.push(diagnostic);
            }
            else if (method.parameters.length > 1 && paramPosition.line === methodLine) {
                const message = `Parameter "${param.id.value}" on same line as label "${method.id.value}".`;
                const diagnostic = new api_1.Diagnostic(param.id.getRange(), message, this.ruleName, api_1.DiagnosticSeverity.Warning);
                diagnostic.source = 'lint';
                diagnostics.push(diagnostic);
            }
            previousParam = param;
        }
        return diagnostics;
    }
}
exports.MethodParametersOnNewLine = MethodParametersOnNewLine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1ldGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wc2xMaW50L3BhcmFtZXRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQkFBbUU7QUFFbkU7O0dBRUc7QUFDSCxNQUFhLHlCQUEwQixTQUFRLGdCQUFVO0lBRXhELE1BQU0sQ0FBQyxNQUFjO1FBRXBCLElBQUksTUFBTSxDQUFDLEtBQUs7WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUU1QixNQUFNLFdBQVcsR0FBaUIsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztRQUUzQyxJQUFJLGFBQW9DLENBQUM7UUFDekMsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO1lBQ3RDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3hDLElBQUksYUFBYSxJQUFJLGFBQWEsQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO2dCQUMzRSxNQUFNLE9BQU8sR0FBRyxjQUFjLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxnQ0FBZ0MsYUFBYSxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQztnQkFDdkcsTUFBTSxVQUFVLEdBQUcsSUFBSSxnQkFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsd0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUMzQixXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzdCO2lCQUNJLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO2dCQUMzRSxNQUFNLE9BQU8sR0FBRyxjQUFjLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyw0QkFBNEIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQztnQkFDNUYsTUFBTSxVQUFVLEdBQUcsSUFBSSxnQkFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsd0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUMzQixXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzdCO1lBQ0QsYUFBYSxHQUFHLEtBQUssQ0FBQztTQUN0QjtRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3BCLENBQUM7Q0FDRDtBQTdCRCw4REE2QkMifQ==