"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function readFile(path) {
    try {
        return fs_1.readFileSync(path, { encoding: "utf-8" });
    }
    catch (e) {
        return null;
    }
}
exports.readFile = readFile;
function writeFile(path, content) {
    try {
        fs_1.writeFileSync(path, content);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.writeFile = writeFile;
function fileExists(path) {
    return fs_1.existsSync(path);
}
exports.fileExists = fileExists;
function hasFolder(folders) {
    return folders && folders.length > 0 ? true : false;
}
exports.hasFolder = hasFolder;
//# sourceMappingURL=filesystem.js.map