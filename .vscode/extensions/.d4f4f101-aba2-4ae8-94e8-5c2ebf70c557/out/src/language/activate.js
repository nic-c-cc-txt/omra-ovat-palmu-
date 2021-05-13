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
const extension_1 = require("../extension");
const codeQuality = require("./codeQuality");
const dataItem_1 = require("./dataItem");
const mumps_1 = require("./mumps");
const previewDocumentation = require("./previewDocumentation");
const pslDefinitionProvider_1 = require("./pslDefinitionProvider");
const pslDocument_1 = require("./pslDocument");
const pslHoverProvider_1 = require("./pslHoverProvider");
const pslSignature_1 = require("./pslSignature");
const pslSuggest_1 = require("./pslSuggest");
const config_1 = require("../parser/config");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const PSL_MODES = [extension_1.PSL_MODE, extension_1.BATCH_MODE, extension_1.TRIG_MODE];
        const MUMPS_MODES = Object.values(mumps_1.MumpsVirtualDocument.schemes).map(scheme => ({ scheme }));
        context.subscriptions.push(
        // Data Hovers
        vscode.languages.registerHoverProvider(extension_1.DATA_MODE, new dataItem_1.DataHoverProvider()), 
        // Data Document Highlights
        vscode.languages.registerDocumentHighlightProvider(extension_1.DATA_MODE, new dataItem_1.DataDocumentHighlightProvider()));
        PSL_MODES.forEach(pslMode => {
            context.subscriptions.push(
            // Document Symbol Outline
            vscode.languages.registerDocumentSymbolProvider(pslMode, new pslDocument_1.PSLDocumentSymbolProvider()), 
            // Completion Items
            vscode.languages.registerCompletionItemProvider(pslMode, new pslSuggest_1.PSLCompletionItemProvider(), '.'), 
            // Signature Help
            vscode.languages.registerSignatureHelpProvider(pslMode, new pslSignature_1.PSLSignatureHelpProvider(), '(', ','), 
            // Go-to Definitions
            vscode.languages.registerDefinitionProvider(pslMode, new pslDefinitionProvider_1.PSLDefinitionProvider()), 
            // Hovers
            vscode.languages.registerHoverProvider(pslMode, new pslHoverProvider_1.PSLHoverProvider()));
        });
        MUMPS_MODES.forEach(mumpsMode => {
            context.subscriptions.push(
            // Content provider for virtual documents
            vscode.workspace.registerTextDocumentContentProvider(mumpsMode.scheme, new mumps_1.MumpsDocumentProvider()), 
            // Document Symbol Outline
            vscode.languages.registerDocumentSymbolProvider(mumpsMode, new pslDocument_1.MumpsDocumentSymbolProvider()));
        });
        projectActivate(context);
        codeQuality.activate(context);
        previewDocumentation.activate(context);
        // Language Configuration
        const wordPattern = /(-?\d*\.\d[a-zA-Z0-9\%\#]*)|([^\`\~\!\@\^\&\*\(\)\-\=\+\[\{\]\}\\\|\"\;\:\'\'\,\.\<\>\/\?\s_]+)/g;
        vscode.languages.setLanguageConfiguration('psl', { wordPattern });
        vscode.languages.setLanguageConfiguration('profileBatch', { wordPattern });
        vscode.languages.setLanguageConfiguration('profileTrigger', { wordPattern });
    });
}
exports.activate = activate;
function previewEnabled(uri) {
    return vscode.workspace.getConfiguration('psl', uri).get('previewFeatures');
}
exports.previewEnabled = previewEnabled;
function projectActivate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaces = new Map();
        if (vscode.workspace.workspaceFolders) {
            vscode.workspace.workspaceFolders.forEach(workspace => {
                workspaces.set(workspace.name, workspace.uri.fsPath);
            });
        }
        return Promise.all(vscode.workspace.workspaceFolders
            .map(workspace => new vscode.RelativePattern(workspace, 'profile-project.json'))
            .map((pattern) => __awaiter(this, void 0, void 0, function* () {
            const watcher = vscode.workspace.createFileSystemWatcher(pattern);
            context.subscriptions.push(watcher.onDidChange(uri => {
                config_1.setConfig(uri.fsPath, workspaces);
            }), watcher.onDidCreate(uri => {
                config_1.setConfig(uri.fsPath, workspaces);
            }));
            watcher.onDidDelete(uri => {
                config_1.removeConfig(uri.fsPath);
            });
            const uris = yield vscode.workspace.findFiles(pattern);
            if (!uris.length)
                return;
            yield config_1.setConfig(uris[0].fsPath, workspaces);
        })));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFuZ3VhZ2UvYWN0aXZhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxpQ0FBaUM7QUFFakMsNENBQTBFO0FBRTFFLDZDQUE2QztBQUM3Qyx5Q0FBOEU7QUFDOUUsbUNBQXNFO0FBQ3RFLCtEQUErRDtBQUMvRCxtRUFBZ0U7QUFDaEUsK0NBQXVGO0FBQ3ZGLHlEQUFzRDtBQUN0RCxpREFBMEQ7QUFDMUQsNkNBQXlEO0FBQ3pELDZDQUEyRDtBQUUzRCxTQUFzQixRQUFRLENBQUMsT0FBZ0M7O1FBRTlELE1BQU0sU0FBUyxHQUFHLENBQUMsb0JBQVEsRUFBRSxzQkFBVSxFQUFFLHFCQUFTLENBQUMsQ0FBQztRQUNwRCxNQUFNLFdBQVcsR0FBNEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyw0QkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXJILE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSTtRQUN6QixjQUFjO1FBQ2QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FDckMscUJBQVMsRUFBRSxJQUFJLDRCQUFpQixFQUFFLENBQ2xDO1FBRUQsMkJBQTJCO1FBQzNCLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQ2pELHFCQUFTLEVBQUUsSUFBSSx3Q0FBNkIsRUFBRSxDQUM5QyxDQUNELENBQUM7UUFFRixTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzNCLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSTtZQUN6QiwwQkFBMEI7WUFDMUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FDOUMsT0FBTyxFQUFFLElBQUksdUNBQXlCLEVBQUUsQ0FDeEM7WUFFRCxtQkFBbUI7WUFDbkIsTUFB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