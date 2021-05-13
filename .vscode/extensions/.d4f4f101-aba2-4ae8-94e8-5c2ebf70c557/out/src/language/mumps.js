"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const parser_1 = require("../parser");
class MumpsVirtualDocument {
    constructor(routineName, sourceCode, 
    /**
     * Uri with scheme in `mumpsSchemes`
     */
    uri) {
        this.routineName = routineName;
        this.sourceCode = sourceCode;
        this.uri = uri;
        this.parsedDocument = parser_1.parseText(sourceCode);
        virtualDocuments.set(uri.toString(), this);
    }
}
exports.MumpsVirtualDocument = MumpsVirtualDocument;
MumpsVirtualDocument.schemes = {
    compiled: 'compiledMumps',
    coverage: 'coverageMumps',
};
class MumpsDocumentProvider {
    provideTextDocumentContent(uri) {
        return getVirtualDocument(uri).sourceCode;
    }
}
exports.MumpsDocumentProvider = MumpsDocumentProvider;
function getVirtualDocument(uri) {
    return virtualDocuments.get(uri.toString());
}
exports.getVirtualDocument = getVirtualDocument;
function isScheme(uri) {
    return Object.values(MumpsVirtualDocument.schemes).indexOf(uri.scheme) > -1;
}
/**
 * Virtual Documents keyed by the string the string representation of their `Uri`s
 */
const virtualDocuments = new Map();
const _onDidDeleteVirtualMumps = new vscode_1.EventEmitter();
exports.onDidDeleteVirtualMumps = _onDidDeleteVirtualMumps.event;
vscode_1.workspace.onDidCloseTextDocument(textDocument => {
    const uri = textDocument.uri;
    if (isScheme(uri)) {
        virtualDocuments.delete(uri.toString());
        _onDidDeleteVirtualMumps.fire(uri);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVtcHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFuZ3VhZ2UvbXVtcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBbUY7QUFDbkYsc0NBQXNEO0FBRXRELE1BQWEsb0JBQW9CO0lBU2hDLFlBQ1UsV0FBbUIsRUFDbkIsVUFBa0I7SUFDM0I7O09BRUc7SUFDTSxHQUFRO1FBTFIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFDbkIsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUlsQixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBRWpCLElBQUksQ0FBQyxjQUFjLEdBQUcsa0JBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1QyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7O0FBbkJGLG9EQW9CQztBQWxCZ0IsNEJBQU8sR0FBRztJQUN6QixRQUFRLEVBQUUsZUFBZTtJQUN6QixRQUFRLEVBQUUsZUFBZTtDQUN6QixDQUFDO0FBaUJILE1BQWEscUJBQXFCO0lBQ2pDLDBCQUEwQixDQUFDLEdBQVE7UUFDbEMsT0FBTyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUM7SUFDM0MsQ0FBQztDQUNEO0FBSkQsc0RBSUM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxHQUFRO0lBQzFDLE9BQU8sZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFGRCxnREFFQztBQUVELFNBQVMsUUFBUSxDQUFDLEdBQVE7SUFDekIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDN0UsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBZ0MsQ0FBQztBQUVqRSxNQUFNLHdCQUF3QixHQUFHLElBQUkscUJBQVksRUFBTyxDQUFDO0FBQzVDLFFBQUEsdUJBQXVCLEdBQUcsd0JBQXdCLENBQUMsS0FBSyxDQUFDO0FBRXRFLGtCQUFTLENBQUMsc0JBQXNCLENBQUMsWUFBWSxDQUFDLEVBQUU7SUFDL0MsTUFBTSxHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQztJQUM3QixJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNsQixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDeEMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ25DO0FBQ0YsQ0FBQyxDQUFDLENBQUMifQ==