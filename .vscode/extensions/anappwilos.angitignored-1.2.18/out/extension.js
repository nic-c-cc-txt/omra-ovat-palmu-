"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const vscode = require("vscode");
const gitignore_hider_1 = require("./gitignore-hider");
const gitignore_reader_1 = require("./gitignore-reader");
const pattern_converter_1 = require("./pattern-converter");
const settings_accessor_1 = require("./settings-accessor");
const Generator_1 = require("./Generator");
function activate(context) {
    /**
     * Extensión for adding specif archive to .gitgnore
     */
    let disposable = vscode.commands.registerCommand('extension.addGitignored', (selectedFile) => {
        let filePath = selectedFile.path.substr(vscode.workspace.rootPath.length + 1, selectedFile.path.length);
        fs.open(vscode.workspace.rootPath + '/.gitignore', 'a', function (err, fd) {
            fs.readFile(vscode.workspace.rootPath + '/.gitignore', 'utf8', function (err, data) {
                if (data.indexOf(filePath) !== -1) {
                    return;
                }
                if (err || data.lastIndexOf('\n') !== data.length - 1) {
                    filePath = '\n' + filePath;
                }
                let buffer = new Buffer(filePath);
                fs.write(fd, buffer, 0, buffer.length, null, function (err) {
                    if (err) {
                        throw new Error('error writing file: ' + err);
                    }
                    fs.close(fd, function () {
                        console.log('file written');
                    });
                });
            });
        });
    });
    context.subscriptions.push(disposable);
    /**
     * Estension for show/hide the archives in .gitignore
     */
    const gitignoreHider = new gitignore_hider_1.GitignoreHider(new gitignore_reader_1.GitignoreReader(), new pattern_converter_1.PatternConverter(), new settings_accessor_1.SettingsAccessor());
    gitignoreHider.registerCommands(context);
    let disposableGitGenerator = vscode.commands.registerCommand("extension.generateGitignored", () => {
        try {
            const generator = new Generator_1.default();
            generator.init();
        }
        catch (e) {
            console.log(e.message);
        }
    });
    context.subscriptions.push(disposableGitGenerator);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map