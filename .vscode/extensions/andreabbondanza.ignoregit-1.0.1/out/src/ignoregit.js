"use strict";
var fs = require('fs');
var path = require('path');
var vscode = require('vscode');
(function (IgnoreType) {
    IgnoreType[IgnoreType["File"] = 0] = "File";
    IgnoreType[IgnoreType["Extension"] = 1] = "Extension";
    IgnoreType[IgnoreType["Folder"] = 2] = "Folder";
})(exports.IgnoreType || (exports.IgnoreType = {}));
var IgnoreType = exports.IgnoreType;
var IgnoreGit = (function () {
    function IgnoreGit() {
        this.gitIgnoreFile = (vscode.workspace.rootPath + "/.gitignore").replace(/\\/g, "/");
    }
    IgnoreGit.prototype.IsGitIgnorePresent = function () {
        return fs.existsSync(this.gitIgnoreFile);
    };
    IgnoreGit.prototype.AddExtension = function (file, type) {
        var content = this.ReadGitFile();
        var myStrings = content.split('\n');
        if (this.IsPresent("*" + path.extname(file), myStrings) > -1)
            return true;
        myStrings[myStrings.length] = "*" + path.extname(file);
        return this.WriteGitFile(myStrings);
    };
    IgnoreGit.prototype.RemoveExtension = function (file) {
        var content = this.ReadGitFile();
        var myStrings = content.split('\n');
        var position = this.IsPresent("*" + path.extname(file), myStrings);
        if (position <= -1)
            return true;
        else {
            myStrings.splice(position, 1);
            return this.WriteGitFile(myStrings);
        }
    };
    IgnoreGit.prototype.AddFile = function (file, type) {
        var content = this.ReadGitFile();
        var myStrings = content.split('\n');
        if (this.IsPresent(file.replace(/\\/g, "/").substring(1), myStrings) > -1)
            return true;
        myStrings[myStrings.length] = file.replace(/\\/g, "/").substring(1);
        return this.WriteGitFile(myStrings);
    };
    IgnoreGit.prototype.RemoveFile = function (file) {
        var content = this.ReadGitFile();
        var myStrings = content.split('\n');
        var position = this.IsPresent(file.replace(/\\/g, "/").substring(1), myStrings);
        if (position <= -1)
            return true;
        else {
            myStrings.splice(position, 1);
            return this.WriteGitFile(myStrings);
        }
    };
    IgnoreGit.prototype.ReadGitFile = function () {
        if (this.IsGitIgnorePresent()) {
            return fs.readFileSync(this.gitIgnoreFile, "utf8");
        }
        else
            return null;
    };
    IgnoreGit.prototype.WriteGitFile = function (content) {
        if (this.IsGitIgnorePresent()) {
            var newContent = content.join('\n');
            fs.unlinkSync(this.gitIgnoreFile);
            fs.writeFileSync(this.gitIgnoreFile, newContent);
            return true;
        }
        else
            return false;
    };
    IgnoreGit.prototype.IsPresent = function (file, content) {
        var result = -1;
        content.forEach(function (element, i) {
            if (element.replace("\r", "").replace("\n", "") === file)
                result = i;
        });
        return result;
    };
    return IgnoreGit;
}());
exports.IgnoreGit = IgnoreGit;
//# sourceMappingURL=ignoregit.js.map