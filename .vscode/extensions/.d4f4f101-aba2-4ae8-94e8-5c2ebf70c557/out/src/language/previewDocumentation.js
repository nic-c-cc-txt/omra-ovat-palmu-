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
const path = require("path");
const request = require("request-light/lib/main");
const vscode = require("vscode");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('psl.previewDocumentation', preparePreview));
    checkForDocumentationServer();
    vscode.workspace.onDidChangeConfiguration(event => {
        if (!event.affectsConfiguration('psl'))
            return;
        checkForDocumentationServer();
    });
}
exports.activate = activate;
function checkForDocumentationServer() {
    const documentationServer = vscode.workspace.getConfiguration('psl', null).get('documentationServer');
    if (documentationServer) {
        vscode.commands.executeCommand('setContext', 'psl.hasDocumentationServer', true);
        return documentationServer;
    }
    else {
        vscode.commands.executeCommand('setContext', 'psl.hasDocumentationServer', false);
        return '';
    }
}
function preparePreview(textEditor) {
    return __awaiter(this, void 0, void 0, function* () {
        const documentationServer = checkForDocumentationServer();
        if (!documentationServer)
            return;
        const markdown = yield getMarkdownFromApi(textEditor.document.getText(), path.basename(textEditor.document.fileName), documentationServer);
        if (!markdown)
            return;
        showPreview(markdown);
    });
}
function showPreview(markdown) {
    return __awaiter(this, void 0, void 0, function* () {
        const untitledDoc = yield vscode.workspace.openTextDocument({ language: 'markdown', content: markdown });
        vscode.commands.executeCommand('markdown.showPreview', untitledDoc.uri);
    });
}
function getMarkdownFromApi(pslText, fileName, documentationServer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = JSON.stringify({
                sourceText: pslText,
            });
            const response = yield request.xhr({
                data,
                headers: {
                    'Content-Length': Buffer.byteLength(data),
                    'Content-Type': 'application/json',
                },
                type: 'POST',
                url: documentationServer + fileName,
            });
            return response.responseText;
        }
        catch (e) {
            vscode.window.showErrorMessage(e.responseText);
            return '';
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJldmlld0RvY3VtZW50YXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFuZ3VhZ2UvcHJldmlld0RvY3VtZW50YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSw2QkFBNkI7QUFDN0Isa0RBQWtEO0FBQ2xELGlDQUFpQztBQUVqQyxTQUFnQixRQUFRLENBQUMsT0FBZ0M7SUFDeEQsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQ3pCLE1BQU0sQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQ3hDLDBCQUEwQixFQUMxQixjQUFjLENBQ2QsQ0FDRCxDQUFDO0lBRUYsMkJBQTJCLEVBQUUsQ0FBQztJQUU5QixNQUFNLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2pELElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTztRQUMvQywyQkFBMkIsRUFBRSxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWRELDRCQWNDO0FBRUQsU0FBUywyQkFBMkI7SUFDbkMsTUFBTSxtQkFBbUIsR0FBVyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUM5RyxJQUFJLG1CQUFtQixFQUFFO1FBQ3hCLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSw0QkFBNEIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRixPQUFPLG1CQUFtQixDQUFDO0tBQzNCO1NBQ0k7UUFDSixNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEYsT0FBTyxFQUFFLENBQUM7S0FDVjtBQUNGLENBQUM7QUFFRCxTQUFlLGNBQWMsQ0FBQyxVQUE2Qjs7UUFDMUQsTUFBTSxtQkFBbUIsR0FBVywyQkFBMkIsRUFBRSxDQUFDO1FBQ2xFLElBQUksQ0FBQyxtQkFBbUI7WUFBRSxPQUFPO1FBRWpDLE1BQU0sUUFBUSxHQUFHLE1BQU0sa0JBQWtCLENBQ3hDLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQzdCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFDM0MsbUJBQW1CLENBQ25CLENBQUM7UUFDRixJQUFJLENBQUMsUUFBUTtZQUFFLE9BQU87UUFDdEIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7Q0FBQTtBQUVELFNBQWUsV0FBVyxDQUFDLFFBQWdCOztRQUMxQyxNQUFNLFdBQVcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3pHLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLHNCQUFzQixFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6RSxDQUFDO0NBQUE7QUFFRCxTQUFlLGtCQUFrQixDQUFDLE9BQWUsRUFBRSxRQUFnQixFQUFFLG1CQUEyQjs7UUFDL0YsSUFBSTtZQUNILE1BQU0sSUFBSSxHQUFXLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25DLFVBQVUsRUFBRSxPQUFPO2FBQ25CLENBQUMsQ0FBQztZQUNILE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDbEMsSUFBSTtnQkFDSixPQUFPLEVBQUU7b0JBQ1IsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7b0JBQ3pDLGNBQWMsRUFBRSxrQkFBa0I7aUJBQ2xDO2dCQUNELElBQUksRUFBRSxNQUFNO2dCQUNaLEdBQUcsRUFBRSxtQkFBbUIsR0FBRyxRQUFRO2FBQ25DLENBQUMsQ0FBQztZQUNILE9BQU8sUUFBUSxDQUFDLFlBQVksQ0FBQztTQUM3QjtRQUNELE9BQU8sQ0FBQyxFQUFFO1lBQ1QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDL0MsT0FBTyxFQUFFLENBQUM7U0FDVjtJQUNGLENBQUM7Q0FBQSJ9