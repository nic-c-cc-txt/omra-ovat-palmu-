"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_URL = "https://www.toptal.com/developers/gitignore/api";
exports.ALTERNATIVE_API_URL = "https://gitignore.palarz.pl";
exports.FILE_NAME = ".gitignore";
exports.MESSAGES = {
    network_error: "There was a problem reaching gitignore.io. Try again.",
    fetching: "Fetching list from gitignore.io...",
    generated: `Your ${exports.FILE_NAME} file has been [action]!`,
    generating: `Generating ${exports.FILE_NAME} file...`,
    save_error: `There was an error while saving ${exports.FILE_NAME} file.`,
};
exports.PLACEHOLDERS = {
    location: `Where should ${exports.FILE_NAME} file be generated?`,
    override: `${exports.FILE_NAME} file exists. Do you want to override it?`,
    selection_hint: "Select using Space or by clicking",
};
exports.USER_RULES = "Custom rules (everything added below won't be overriden by 'Generate .gitignore File' if you use 'Update' option)";
exports.BANNER = "File created using '.gitignore Generator' for Visual Studio Code: https://bit.ly/vscode-gig";
exports.OVERRIDE_OPTIONS = [
    {
        label: "Override",
        description: `Overrides entire ${exports.FILE_NAME} file`,
    },
    {
        label: "Update",
        description: `Updates ${exports.FILE_NAME} file keeping existing and user-defined rules`,
    },
];
//# sourceMappingURL=config.js.map