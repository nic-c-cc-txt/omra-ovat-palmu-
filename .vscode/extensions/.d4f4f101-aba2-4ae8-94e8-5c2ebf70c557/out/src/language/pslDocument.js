"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const parser = require("../parser/parser");
const mumps_1 = require("./mumps");
class PSLDocumentSymbolProvider {
    provideDocumentSymbols(document) {
        return new Promise(resolve => {
            const parsedDoc = parser.parseText(document.getText());
            const symbols = [];
            parsedDoc.methods.forEach(method => {
                symbols.push(createMethodSymbol(method, document));
            });
            parsedDoc.properties.forEach(property => {
                const propertyNameToken = property.id;
                const name = propertyNameToken.value;
                const containerName = '';
                const position = propertyNameToken.position;
                const location = new vscode.Location(document.uri, new vscode.Position(position.line, position.character));
                symbols.push(new vscode.SymbolInformation(name, vscode.SymbolKind.Property, containerName, location));
            });
            resolve(symbols);
        });
    }
}
exports.PSLDocumentSymbolProvider = PSLDocumentSymbolProvider;
/**
 * Outline provider for MUMPS
 */
class MumpsDocumentSymbolProvider {
    provideDocumentSymbols(document) {
        const symbols = [];
        const parsedDoc = this.getParsedDoc(document);
        parsedDoc.methods.forEach(method => {
            symbols.push(createMethodSymbol(method, document));
        });
        return symbols;
    }
    getParsedDoc(document) {
        const cachedMumps = mumps_1.getVirtualDocument(document.uri);
        if (cachedMumps)
            return cachedMumps.parsedDocument;
        else
            return parser.parseText(document.getText());
    }
}
exports.MumpsDocumentSymbolProvider = MumpsDocumentSymbolProvider;
function createMethodSymbol(method, document) {
    const methodToken = method.id;
    const name = methodToken.value;
    const containerName = '';
    const startPosition = new vscode.Position(methodToken.position.line, 0);
    let endPositionNumber = method.endLine;
    if (endPositionNumber === -1)
        endPositionNumber = document.lineCount - 1; // last line
    const endPosition = new vscode.Position(endPositionNumber, 0);
    const methodRange = new vscode.Location(document.uri, new vscode.Range(startPosition, endPosition));
    const kind = method.batch ? vscode.SymbolKind.Module : vscode.SymbolKind.Function;
    return new vscode.SymbolInformation(name, kind, containerName, methodRange);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNsRG9jdW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFuZ3VhZ2UvcHNsRG9jdW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBaUM7QUFDakMsMkNBQTJDO0FBQzNDLG1DQUE2QztBQUU3QyxNQUFhLHlCQUF5QjtJQUU5QixzQkFBc0IsQ0FBQyxRQUE2QjtRQUMxRCxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzVCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDdkQsTUFBTSxPQUFPLEdBQStCLEVBQUUsQ0FBQztZQUMvQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUMsQ0FBQztZQUNILFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN2QyxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLE1BQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQztnQkFDckMsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO2dCQUN6QixNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUM7Z0JBQzVDLE1BQU0sUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUMzRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN2RyxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRDtBQXBCRCw4REFvQkM7QUFFRDs7R0FFRztBQUNILE1BQWEsMkJBQTJCO0lBRWhDLHNCQUFzQixDQUFDLFFBQTZCO1FBQzFELE1BQU0sT0FBTyxHQUErQixFQUFFLENBQUM7UUFDL0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNsQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVELFlBQVksQ0FBQyxRQUE2QjtRQUN6QyxNQUFNLFdBQVcsR0FBRywwQkFBa0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckQsSUFBSSxXQUFXO1lBQUUsT0FBTyxXQUFXLENBQUMsY0FBYyxDQUFDOztZQUM5QyxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDbEQsQ0FBQztDQUNEO0FBaEJELGtFQWdCQztBQUVELFNBQVMsa0JBQWtCLENBQUMsTUFBcUIsRUFBRSxRQUE2QjtJQUMvRSxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQzlCLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7SUFDL0IsTUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBRXpCLE1BQU0sYUFBYSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV4RSxJQUFJLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDdkMsSUFBSSxpQkFBaUIsS0FBSyxDQUFDLENBQUM7UUFBRSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQVk7SUFDdEYsTUFBTSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlELE1BQU0sV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNwRyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7SUFDbEYsT0FBTyxJQUFJLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUM3RSxDQUFDIn0=