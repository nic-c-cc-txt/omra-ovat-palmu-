"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fsExtra = require("fs-extra");
function getFullContext(context, useActiveTextEditor) {
    let fsPath = '';
    let mode;
    let activeTextEditor = vscode.window.activeTextEditor;
    if (context) {
        fsPath = context.fsPath;
        mode = fsExtra.lstatSync(fsPath).isFile() ? 1 /* FILE */ : 2 /* DIRECTORY */;
        return { fsPath, mode };
    }
    else if (useActiveTextEditor && activeTextEditor) {
        fsPath = activeTextEditor.document.fileName;
        mode = 1 /* FILE */;
        return { fsPath, mode };
    }
    else {
        mode = 3 /* EMPTY */;
        return { fsPath, mode };
    }
}
exports.getFullContext = getFullContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vY29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFpQztBQUNqQyxvQ0FBb0M7QUFpQnBDLFNBQWdCLGNBQWMsQ0FBQyxPQUE0QyxFQUFFLG1CQUE2QjtJQUN6RyxJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUM7SUFDeEIsSUFBSSxJQUFpQixDQUFDO0lBQ3RCLElBQUksZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztJQUV0RCxJQUFJLE9BQU8sRUFBRTtRQUNaLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3hCLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsY0FBa0IsQ0FBQyxrQkFBc0IsQ0FBQztRQUNyRixPQUFPLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDO0tBQ3RCO1NBQ0ksSUFBSSxtQkFBbUIsSUFBSSxnQkFBZ0IsRUFBRTtRQUNqRCxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztRQUM1QyxJQUFJLGVBQW1CLENBQUM7UUFDeEIsT0FBTyxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQztLQUN0QjtTQUNJO1FBQ0osSUFBSSxnQkFBb0IsQ0FBQztRQUN6QixPQUFPLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDO0tBQ3RCO0FBQ0YsQ0FBQztBQW5CRCx3Q0FtQkMifQ==