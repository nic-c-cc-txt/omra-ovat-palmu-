"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class PSLDiagnostic {
    constructor(message, severity, file, range) {
        this.message = message;
        this.severity = severity;
        this.file = file;
        this.range = range;
        this.diagnostic = new vscode.Diagnostic(this.range, this.message, this.severity);
    }
    static setDiagnostics(pslDiagnostics, envName, fsPath) {
        let diagnosticMap = new Map();
        pslDiagnostics.forEach(pslDiagnostic => {
            let canonicalFile = vscode.Uri.file(pslDiagnostic.file).toString();
            let diagnostics = diagnosticMap.get(canonicalFile);
            pslDiagnostic.diagnostic.source = envName;
            if (!diagnostics) {
                diagnostics = [];
            }
            diagnostics.push(pslDiagnostic.diagnostic);
            diagnosticMap.set(canonicalFile, diagnostics);
        });
        let collection = this.diagnosticCollections.find(col => col.name === envName);
        if (!collection) {
            collection = this.registerCollection(envName);
        }
        let uri = vscode.Uri.file(fsPath);
        collection.delete(uri);
        diagnosticMap.forEach((diags, file) => {
            collection.set(vscode.Uri.parse(file), diags);
        });
    }
    static registerCollection(envName) {
        let collection = vscode.languages.createDiagnosticCollection(envName);
        vscode.workspace.onDidCloseTextDocument((textDocument) => {
            let uri = textDocument.uri;
            collection.delete(uri);
        });
        this.diagnosticCollections.push(collection);
        return collection;
    }
}
exports.PSLDiagnostic = PSLDiagnostic;
PSLDiagnostic.diagnosticCollections = [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2RpYWdub3N0aWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWlDO0FBRWpDLE1BQWEsYUFBYTtJQTRDekIsWUFBWSxPQUFlLEVBQUUsUUFBbUMsRUFBRSxJQUFZLEVBQUUsS0FBbUI7UUFDbEcsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFbkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRixDQUFDO0lBL0NELE1BQU0sQ0FBQyxjQUFjLENBQUMsY0FBK0IsRUFBRSxPQUFlLEVBQUUsTUFBYztRQUNyRixJQUFJLGFBQWEsR0FBcUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNoRSxjQUFjLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3RDLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuRSxJQUFJLFdBQVcsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ25ELGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztZQUMxQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUFFLFdBQVcsR0FBRyxFQUFFLENBQUM7YUFBRTtZQUV2QyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzQyxhQUFhLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxVQUFVLEVBQUc7WUFDakIsVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM5QztRQUNELElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUNyQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRS9DLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFlO1FBQ3hDLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ3hELElBQUksR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUM7WUFDM0IsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FBQTtRQUNGLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDNUMsT0FBTyxVQUFVLENBQUM7SUFDbkIsQ0FBQzs7QUFuQ0Ysc0NBb0RDO0FBbERPLG1DQUFxQixHQUFrQyxFQUFFLENBQUMifQ==