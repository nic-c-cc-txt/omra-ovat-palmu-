'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
var PathType;
(function (PathType) {
    PathType[PathType["withFilePath"] = 0] = "withFilePath";
    PathType[PathType["withFileDirectoryPath"] = 1] = "withFileDirectoryPath";
    PathType[PathType["withWorkSpacePath"] = 2] = "withWorkSpacePath";
})(PathType = exports.PathType || (exports.PathType = {}));
// file_or_folder_path - the path to a file, a folder or a leading part of the path. E.g. K:, C:\Program Files, C:\Docume.
// /unlock or -u - unlocks the file_or_folder_path. It closes all handles to the files\folder that starts from file_or_folder_path and unloads .dlls which are residing in the files\folder that starts from file_or_folder_path.
// /delete or -d - unlocks and deletes the file_or_folder_path. If file_or_folder_path is a partial name of a path (e.g. "c:\Docu" is a partial name of "C:\Documents and Settings"), all the files and folders that starts from file_or_folder_path will be deleted. Note, if there's processes launched from file_or_folder_path they will prevent to delete the folder\file. Use /kill parameter to forcibly terminate such apps.
// /delperm or -dp - an optional parameter for /delete asking the program to delete the file_or_folder_path permanently bypassing the recycle bin. Use it only with /delete parameter, e.g. LockHunter.exe /delete /delperm c:\somefile.exe
// /kill or -k - terminates all the apps which are launched from file_or_folder_path. If file_or_folder_path is a partial name of a path (e.g. "c:\Docu" is a partial name of "C:\Documents and Settings"), all the processes which launch paths start from file_or_folder_path string will be terminated.
// /silent or -sm - no GUI will be displayed. The program starts in silent mode, does one of the passed commands (e.g. /unlock) and terminates.
// /exit or -x - exits automatically when all actions are done. This option might be required only when you wish to see the GUI, all displayed warnings but do not wish to press the button "exit" manually.
class Lockhunter {
    static viewWorkspace() {
        this.run("", PathType.withWorkSpacePath);
    }
    static viewFile() {
        this.run("", PathType.withFilePath);
    }
    static viewFileDirectory() {
        this.run("", PathType.withFileDirectoryPath);
    }
    static unlockWorkspace() {
        this.run("/unlock", PathType.withWorkSpacePath, true, true);
    }
    static unlockFile() {
        this.run("/unlock", PathType.withFilePath, true, true);
    }
    static unlockFileDirectory() {
        this.run("/unlock", PathType.withFileDirectoryPath, true, true);
    }
    static run(command = null, pathType = PathType.withWorkSpacePath, allowSilent = false, allowExit = false) {
        let targetPath = null;
        switch (pathType) {
            case PathType.withFileDirectoryPath:
                targetPath = this.getWorkingFileDirectory();
                break;
            case PathType.withWorkSpacePath:
                targetPath = this.getWorkspaceDirectory();
                break;
            case PathType.withFilePath:
                targetPath = this.getWorkingFile();
                break;
            default:
                targetPath = this.getWorkspaceDirectory();
                break;
        }
        let launcherPath = vscode.workspace.getConfiguration("lockhunter").get("launcherPath");
        let silent = allowSilent && vscode.workspace.getConfiguration("lockhunter").get("silentunlocks") ? '-sm' : '';
        let exit = allowExit && vscode.workspace.getConfiguration("lockhunter").get("exit") ? '-x' : '';
        let cmd = `"${launcherPath}" ${command} ${targetPath}  ${silent} ${exit}`;
        require("child_process").exec(cmd);
    }
    static getWorkspaceDirectory() {
        if (vscode.workspace.rootPath) {
            return vscode.workspace.rootPath;
        }
        return null;
    }
    static getWorkingFileDirectory() {
        if (vscode.window.activeTextEditor) {
            return path.dirname(this.getWorkingFile());
        }
        return null;
    }
    static getWorkingFile() {
        if (vscode.window.activeTextEditor) {
            return vscode.window.activeTextEditor.document.fileName;
        }
        return null;
    }
}
exports.Lockhunter = Lockhunter;
//# sourceMappingURL=Lockhunter.js.map