"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class GitignoreHider {
    constructor(_reader, _converter, _settings) {
        this._reader = _reader;
        this._converter = _converter;
        this._settings = _settings;
    }
    registerCommands(context) {
        const hideDisposable = vscode_1.commands.registerCommand('extension.hideGitignored', () => {
            this.run();
        });
        context.subscriptions.push(hideDisposable);
        const showDisposable = vscode_1.commands.registerCommand('extension.showGitignored', () => {
            this.run(true);
        });
        context.subscriptions.push(showDisposable);
    }
    run(show = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield vscode_1.workspace.findFiles('**/.gitignore');
            if (files.length < 1) {
                return;
            }
            const handlers = files.map((file) => vscode_1.workspace.openTextDocument(file));
            const docs = yield Promise.all(handlers);
            const patterns = docs
                .map((doc) => this._reader.read(doc))
                .map((gitignore) => this._converter.convert(gitignore))
                .reduce((prev, cur) => cur.concat(prev), []);
            if (show) {
                yield this._settings.show(patterns);
            }
            else {
                yield this._settings.hide(patterns);
            }
        });
    }
}
exports.GitignoreHider = GitignoreHider;
//# sourceMappingURL=gitignore-hider.js.map