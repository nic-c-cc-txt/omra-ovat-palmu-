"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const vscode_1 = require("vscode");
/**
 * Read the .gitignore file line-by-line
 *
 * @export
 * @class GitignoreReader
 */
class GitignoreReader {
    /**
     * Read TextDocument into a string array, wrapped in Gitignore
     *
     * @param {TextDocument} document
     * @returns {Gitignore}
     * @memberof GitignoreReader
     */
    read(document) {
        const lineCount = document.lineCount;
        const lines = [];
        for (let index = 0; index < lineCount; index++) {
            lines.push(document.lineAt(index).text);
        }
        const path = path_1.dirname(vscode_1.workspace.asRelativePath(document.fileName));
        return { lines, path };
    }
}
exports.GitignoreReader = GitignoreReader;
//# sourceMappingURL=gitignore-reader.js.map