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
const path = require("path");
const vscode_1 = require("vscode");
const config_1 = require("./modules/config");
const ui_1 = require("./modules/ui");
const filesystem_1 = require("./modules/filesystem");
const http_1 = require("./modules/http");
const helpers_1 = require("./modules/helpers");
class Generator {
    constructor() {
        this.folders = vscode_1.workspace.workspaceFolders;
        this.filePath = null;
        this.override = true;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.filePath = yield this.getFilePath();
            if (this.filePath) {
                this.override = yield this.getOverrideOption();
            }
            this.selected = yield this.getSelectedOptions();
            this.generate();
        });
    }
    get(fn, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield fn.apply(this, args);
            if (result === undefined) {
                this.abort();
            }
            return result;
        });
    }
    getFilePath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!filesystem_1.hasFolder(this.folders)) {
                return null;
            }
            const folderName = this.folders.length > 1
                ? yield this.get(ui_1.getFolderOption, this.folders)
                : this.folders[0].name;
            const folderPath = this.folders.find(folder => folder.name === folderName).uri.fsPath;
            return path.join(folderPath, config_1.FILE_NAME);
        });
    }
    getOverrideOption() {
        return __awaiter(this, void 0, void 0, function* () {
            return filesystem_1.fileExists(this.filePath)
                ? yield this.get(ui_1.getOverrideOption)
                : true;
        });
    }
    getSelectedOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            let message = vscode_1.window.setStatusBarMessage(config_1.MESSAGES.fetching);
            const list = yield helpers_1.getList(this.filePath, !this.override);
            message.dispose();
            if (list === null) {
                return vscode_1.window.showErrorMessage(config_1.MESSAGES.network_error);
            }
            return yield this.get(ui_1.getItemsOption, list);
        });
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            const message = vscode_1.window.setStatusBarMessage(config_1.MESSAGES.generating);
            const data = yield http_1.getData(`${config_1.API_URL}/${this.selected.join(",")}`);
            if (data === null) {
                return vscode_1.window.showErrorMessage(config_1.MESSAGES.network_error);
            }
            const output = helpers_1.generateFile(this.filePath, data, this.override);
            if (this.filePath) {
                const result = filesystem_1.writeFile(this.filePath, output);
                if (result === false) {
                    message.dispose();
                    vscode_1.window.showErrorMessage(config_1.MESSAGES.save_error);
                    this.abort();
                }
                ui_1.openFile(this.filePath);
            }
            else {
                ui_1.openUntitledFile(output);
            }
            message.dispose();
            vscode_1.window.setStatusBarMessage(config_1.MESSAGES.generated.replace("[action]", this.override ? "created" : "updated"), 3000);
        });
    }
    abort() {
        throw new Error("Extension action aborted");
    }
}
exports.default = Generator;
//# sourceMappingURL=Generator.js.map