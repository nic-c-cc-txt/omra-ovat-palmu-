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
const os = require("os");
const filesystem_1 = require("./filesystem");
const http_1 = require("./http");
const config_1 = require("./config");
function getList(path, keepCurrent) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield http_1.getData(`${config_1.API_URL}/list`);
        if (data === null) {
            return null;
        }
        const selectedItems = getSelectedItems(path, keepCurrent);
        const items = data.split(/[,\n\r]+/).map(item => ({
            label: item,
            picked: selectedItems.indexOf(item) !== -1,
        }));
        items.pop();
        items.sort((a, b) => {
            if (a.picked) {
                return -1;
            }
            else if (b.picked) {
                return 1;
            }
            return 0;
        });
        return items;
    });
}
exports.getList = getList;
function getOs() {
    const systems = {
        darwin: "macos",
        linux: "linux",
        win32: "windows",
    };
    const system = systems[os.platform()];
    return system ? system : null;
}
exports.getOs = getOs;
function getCurrentItems(path) {
    const file = filesystem_1.readFile(path);
    if (file === null) {
        return [];
    }
    const regex = /^# Created by.+\/(.+)$/m;
    const result = regex.exec(file);
    return result && result[1] ? result[1].split(",") : [];
}
exports.getCurrentItems = getCurrentItems;
function getUserRules(filePath) {
    const file = filesystem_1.readFile(filePath);
    if (file === null) {
        return null;
    }
    const result = file.split(config_1.USER_RULES)[1];
    console.log(result);
    return result ? result.trim() : null;
}
exports.getUserRules = getUserRules;
function getSelectedItems(filePath, keepCurrent) {
    const selected = [];
    if (!keepCurrent) {
        selected.push("visualstudiocode", getOs());
    }
    if (keepCurrent && filePath) {
        selected.push(...getCurrentItems(filePath));
    }
    return selected.filter(item => !!item);
}
exports.getSelectedItems = getSelectedItems;
function generateFile(path, output, override) {
    output = `# ${config_1.BANNER}\n${output}\n# ${config_1.USER_RULES}\n`;
    if (!override) {
        const userRules = getUserRules(path);
        output += userRules ? `\n${userRules}` : "";
    }
    return `${output}\n`;
}
exports.generateFile = generateFile;
//# sourceMappingURL=helpers.js.map