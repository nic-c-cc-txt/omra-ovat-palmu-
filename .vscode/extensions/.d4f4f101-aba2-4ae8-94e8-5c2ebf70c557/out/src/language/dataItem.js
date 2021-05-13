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
const vscode = require("vscode");
const jsonc = require("jsonc-parser");
const fs = require("fs-extra");
function getEnvBase(fileName) {
    return vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fileName)).uri.fsPath;
}
class DataHoverProvider {
    provideHover(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            // array of column names
            let columnNames = document.lineAt(0).text.split('\t');
            // the text up to the cursor
            let textToPosition = document.getText(new vscode.Range(position.line, 0, position.line, position.character));
            // position of current data item
            let currentDataItemPosition = textToPosition.split('\t').length - 1;
            // full text of data item
            let dataItemText = document.lineAt(position.line).text.split('\t')[currentDataItemPosition];
            let prevTabPos = textToPosition.lastIndexOf('\t') + 1;
            let nextTabPos = prevTabPos + dataItemText.length;
            if (currentDataItemPosition <= columnNames.length) {
                let columnName = columnNames[currentDataItemPosition];
                let tableName = path.basename(document.fileName).replace('.DAT', '');
                let fileName = `${tableName.toUpperCase()}-${columnName.toUpperCase()}.COL`;
                let link = path.join(getEnvBase(document.fileName), 'dataqwik', 'table', `${tableName.toLowerCase()}`, `${fileName}`);
                let content;
                if (!fs.existsSync(link)) {
                    content = new vscode.MarkdownString(`COLUMN: **${columnName}**`);
                }
                else {
                    let uri = vscode.Uri.file(link);
                    let tbl = yield vscode.workspace.openTextDocument(uri);
                    let tblJSON = jsonc.parse(tbl.getText());
                    content = new vscode.MarkdownString(`COLUMN: **[${columnName}](command:vscode.open?${encodeURIComponent(JSON.stringify(uri))})** (*${tblJSON['DES']}*)`);
                }
                content.isTrusted = true;
                return new vscode.Hover(content, new vscode.Range(position.line, prevTabPos, position.line, nextTabPos));
            }
            return undefined;
        });
    }
}
exports.DataHoverProvider = DataHoverProvider;
class DataDocumentHighlightProvider {
    provideDocumentHighlights(document, position) {
        return __awaiter(this, void 0, void 0, function* () {
            // the text up to the cursor
            let textToPosition = document.getText(new vscode.Range(position.line, 0, position.line, position.character));
            // position of current data item
            let currentDataItemPosition = textToPosition.split('\t').length - 1;
            let highlights = [];
            for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
                let text = document.lineAt(lineNumber).text;
                if (!text)
                    continue;
                let row = document.lineAt(lineNumber).text.split('\t');
                let dataItemText = row[currentDataItemPosition];
                let textToPosition = row.slice(0, currentDataItemPosition + 1).join('\t');
                let prevTabCol = textToPosition.lastIndexOf('\t') + 1;
                let nextTabCol = prevTabCol + dataItemText.length;
                let range = new vscode.Range(lineNumber, prevTabCol, lineNumber, nextTabCol);
                document.validateRange(range);
                let highlight = new vscode.DocumentHighlight(range, vscode.DocumentHighlightKind.Write);
                highlights.push(highlight);
            }
            return highlights;
        });
    }
}
exports.DataDocumentHighlightProvider = DataDocumentHighlightProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFuZ3VhZ2UvZGF0YUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDLHNDQUFzQztBQUN0QywrQkFBOEI7QUFFOUIsU0FBUyxVQUFVLENBQUMsUUFBZ0I7SUFDbkMsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQTtBQUNqRixDQUFDO0FBRUQsTUFBYSxpQkFBaUI7SUFDaEIsWUFBWSxDQUFDLFFBQTZCLEVBQUUsUUFBeUI7O1lBRWpGLHdCQUF3QjtZQUN4QixJQUFJLFdBQVcsR0FBa0IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXJFLDRCQUE0QjtZQUM1QixJQUFJLGNBQWMsR0FBVyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRXJILGdDQUFnQztZQUNoQyxJQUFJLHVCQUF1QixHQUFXLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUU1RSx5QkFBeUI7WUFDekIsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBRTVGLElBQUksVUFBVSxHQUFXLGNBQWMsQ0FB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