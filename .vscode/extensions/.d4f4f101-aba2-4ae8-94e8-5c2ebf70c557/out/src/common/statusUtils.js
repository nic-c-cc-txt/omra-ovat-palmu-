"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function updateStatus(status, langs) {
    if (langs.length === 0) {
        status.show();
    }
    else if (vscode.window.activeTextEditor && langs.indexOf(vscode.window.activeTextEditor.document.languageId) >= 0) {
        status.show();
    }
    else {
        status.hide();
    }
}
exports.updateStatus = updateStatus;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3N0YXR1c1V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWlDO0FBRWpDLFNBQWdCLFlBQVksQ0FBQyxNQUE0QixFQUFFLEtBQW9CO0lBQzlFLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDdkIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2Q7U0FDSSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDbEgsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2Q7U0FDSTtRQUNKLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNkO0FBQ0YsQ0FBQztBQVZELG9DQVVDIn0=