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
const errorHandler_1 = require("./errorHandler");
const utils_1 = require("./utils");
const requirePkg_1 = require("./requirePkg");
const prettierStylelint_1 = require("./prettierStylelint");
prettierStylelint_1.default;
const prettierEslint = require('prettier-eslint');
errorHandler_1.setUsedModule('prettier-eslint', 'Unknown', true);
const bundledPrettier = require('prettier');
const fs = require('fs');
const path = require('path');
const nodePathFromVscodeSettingFile = vscode_1.workspace.getConfiguration('eslint').nodePath;
const nodePath = nodePathFromVscodeSettingFile
    ? path.join(nodePathFromVscodeSettingFile, 'eslint')
    : './node_modules/eslint';
const { CLIEngine } = require(path.resolve(vscode_1.workspace.rootPath, nodePath));
const cliEngine = new CLIEngine();
let eslintConfig = undefined;
const STYLE_PARSERS = ['postcss', 'css', 'less', 'scss'];
function hasPrettierConfig(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const { config } = yield resolveConfig(filePath);
        return config !== null;
    });
}
function resolveConfig(filePath, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = yield bundledPrettier.resolveConfig(filePath, options);
            return { config };
        }
        catch (error) {
            return { config: null, error };
        }
    });
}
function mergeConfig(hasPrettierConfig, additionalConfig, prettierConfig, vscodeConfig) {
    return hasPrettierConfig
        ? Object.assign({ parser: vscodeConfig.parser }, prettierConfig, additionalConfig)
        : Object.assign(vscodeConfig, prettierConfig, additionalConfig);
}
function format(text, { fileName, languageId, uri, isUntitled }, customOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const vscodeConfig = utils_1.getConfig(uri);
        const localPrettier = requirePkg_1.requireLocalPkg(fileName, 'prettier');
        if (vscodeConfig.disableLanguages.includes(languageId)) {
            return text;
        }
        const dynamicParsers = utils_1.getParsersFromLanguageId(languageId, localPrettier, isUntitled ? undefined : fileName);
        let useBundled = false;
        let parser;
        if (!dynamicParsers.length) {
            const bundledParsers = utils_1.getParsersFromLanguageId(languageId, bundledPrettier, isUntitled ? undefined : fileName);
            parser = bundledParsers[0] || 'babylon';
            useBundled = true;
        }
        else if (dynamicParsers.includes(vscodeConfig.parser)) {
            parser = vscodeConfig.parser;
        }
        else {
            parser = dynamicParsers[0];
        }
        const doesParserSupportEslint = [
            'javascript',
            'javascriptreact',
            'typescript',
            'typescriptreact',
            'vue',
        ].includes(languageId);
        const hasConfig = yield hasPrettierConfig(fileName);
        if (!hasConfig && vscodeConfig.requireConfig) {
            return text;
        }
        const { config: fileOptions, error } = yield resolveConfig(fileName, {
            editorconfig: true,
        });
        if (error) {
            errorHandler_1.addToOutput(`Failed to resolve config for ${fileName}. Falling back to the default config settings.`);
        }
        const prettierOptions = mergeConfig(hasConfig, customOptions, fileOptions || {}, {
            printWidth: vscodeConfig.printWidth,
            tabWidth: vscodeConfig.tabWidth,
            singleQuote: vscodeConfig.singleQuote,
            trailingComma: vscodeConfig.trailingComma,
            bracketSpacing: vscodeConfig.bracketSpacing,
            jsxBracketSameLine: vscodeConfig.jsxBracketSameLine,
            parser: parser,
            semi: vscodeConfig.semi,
            useTabs: vscodeConfig.useTabs,
            proseWrap: vscodeConfig.proseWrap,
            arrowParens: vscodeConfig.arrowParens,
            jsxSingleQuote: vscodeConfig.jsxSingleQuote,
            htmlWhitespaceSensitivity: vscodeConfig.htmlWhitespaceSensitivity,
            endOfLine: vscodeConfig.endOfLine,
        });
        function getSettingFilePath() {
            const settingPath = './.vscode/settings.json';
            return new Promise((resolve) => {
                fs.readFile(path.resolve(vscode_1.workspace.rootPath, settingPath), 'utf8', (err, data) => {
                    if (!err) {
                        try {
                            const settings = JSON.parse(data);
                            resolve(settings);
                        }
                        catch (error) {
                            errorHandler_1.addToOutput('Failed to parse /.vscode/settings.json file, please check it again.');
                        }
                    }
                    else {
                        errorHandler_1.addToOutput(`Failed to read user config for ${vscode_1.workspace.rootPath +
                            settingPath}. Falling back to the default stylelintrc config.`);
                        resolve(fileName);
                    }
                });
            });
        }
        function getLintrcPath(lintType) {
            return getSettingFilePath().then((settingConfig) => {
                let lintrcPath;
                if (lintType === 'eslint') {
                    lintrcPath =
                        settingConfig['eslint.options'] &&
                            settingConfig['eslint.options'].configFile;
                }
                else if (lintType === 'stylelint') {
                    lintrcPath =
                        settingConfig['stylelint.config'] &&
                            settingConfig['stylelint.config'].extends;
                }
                return lintrcPath && path.resolve(vscode_1.workspace.rootPath, lintrcPath)
                    || undefined;
            });
        }
        function getEslintConfig() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const eslitrcPath = yield getLintrcPath('eslint');
                    if (!eslintConfig) {
                        eslintConfig = cliEngine.getConfigForFile(eslitrcPath);
                    }
                    return eslintConfig;
                }
                catch (error) {
                    throw error;
                }
            });
        }
        function prettierEslintAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                return prettierEslint({
                    text,
                    filePath: fileName,
                    eslintConfig: yield getEslintConfig(),
                    fallbackPrettierOptions: prettierOptions,
                    eslintPath: path.resolve(vscode_1.workspace.rootPath, nodePath),
                });
            });
        }
        if (vscodeConfig.tslintIntegration && parser === 'typescript') {
            return errorHandler_1.safeExecution(() => {
                const prettierTslint = require('prettier-tslint')
                    .format;
                errorHandler_1.setUsedModule('prettier-tslint', 'Unknown', true);
                return prettierTslint({
                    text,
                    filePath: fileName,
                    fallbackPrettierOptions: prettierOptions,
                });
            }, text, fileName);
        }
        if (vscodeConfig.eslintIntegration && doesParserSupportEslint) {
            return errorHandler_1.safeExecution(prettierEslintAsync(), text, fileName);
        }
        if (vscodeConfig.stylelintIntegration && STYLE_PARSERS.includes(parser)) {
            return errorHandler_1.safeExecution(prettierStylelint_1.default.format({
                text,
                filePath: fileName,
                prettierOptions,
                stylelintConfigPath: yield getLintrcPath('stylelint'),
            }), text, fileName);
        }
        if (!doesParserSupportEslint && useBundled) {
            return errorHandler_1.safeExecution(() => {
                const warningMessage = `prettier@${localPrettier.version} doesn't support ${languageId}. ` +
                    `Falling back to bundled prettier@${bundledPrettier.version}.`;
                errorHandler_1.addToOutput(warningMessage);
                errorHandler_1.setUsedModule('prettier', bundledPrettier.version, true);
                return bundledPrettier.format(text, prettierOptions);
            }, text, fileName);
        }
        errorHandler_1.setUsedModule('prettier', localPrettier.version, false);
        return errorHandler_1.safeExecution(() => localPrettier.format(text, prettierOptions), text, fileName);
    });
}
function fullDocumentRange(document) {
    const lastLineId = document.lineCount - 1;
    return new vscode_1.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}
class PrettierEditProvider {
    constructor(_fileIsIgnored) {
        this._fileIsIgnored = _fileIsIgnored;
    }
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        return this._provideEdits(document, {
            rangeStart: document.offsetAt(range.start),
            rangeEnd: document.offsetAt(range.end),
        });
    }
    provideDocumentFormattingEdits(document, options, token) {
        return this._provideEdits(document, {});
    }
    _provideEdits(document, options) {
        if (!document.isUntitled && this._fileIsIgnored(document.fileName)) {
            return Promise.resolve([]);
        }
        return format(document.getText(), document, options).then(code => [
            vscode_1.TextEdit.replace(fullDocumentRange(document), code),
        ]);
    }
}
exports.default = PrettierEditProvider;
//# sourceMappingURL=PrettierEditProvider.js.map