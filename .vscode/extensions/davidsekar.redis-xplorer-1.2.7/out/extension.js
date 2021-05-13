"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RedisExplorer_1 = require("./RedisExplorer");
function activate(context) {
    // tslint:disable-next-line:no-unused-expression
    new RedisExplorer_1.RedisXplorer(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map