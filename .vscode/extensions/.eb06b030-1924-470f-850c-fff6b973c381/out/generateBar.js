"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode;
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
const _ = require("lodash");
const Presets = require("./presets");
const Delims = require("./delims");
function buildCommentBarLine(width, text, fillChar, commentDelims, seamlessFill = false) {
    const tmpWidth = Math.round(width);
    const tmpText = (_.isString(text)) ? (text.trim()) : '';
    const insertedText = (tmpText.length > 0) ? ` ${tmpText} ` : '';
    const insertedTextLen = insertedText.length;
    const lengthBeforeBase = Math.round((tmpWidth - insertedTextLen) / 2.0);
    const lengthAfterBase = tmpWidth - (insertedTextLen + lengthBeforeBase);
    let startCmt = `${commentDelims.start}`;
    let endCmt = (commentDelims.end) ? (`${commentDelims.end}`) : '';
    if (seamlessFill) {
        const trimmedStartCmt = startCmt.trimRight();
        const startCmtBorderChar = _.last(trimmedStartCmt);
        if (startCmtBorderChar === fillChar) {
            startCmt = trimmedStartCmt;
        }
        const trimmedEndCmt = endCmt.trimLeft();
        const endCmtBorderChar = _.first(trimmedEndCmt);
        if (endCmtBorderChar === fillChar) {
            endCmt = trimmedStartCmt;
        }
    }
    const startCmtLen = startCmt.length;
    const endCmtLen = endCmt.length;
    const lengthBefore = lengthBeforeBase - startCmtLen;
    const lengthAfter = lengthAfterBase - endCmtLen;
    const fillBefore = _.repeat(fillChar, lengthBefore);
    const fillAfter = _.repeat(fillChar, lengthAfter);
    const wordLineBefore = `${startCmt}${fillBefore}`;
    const wordLineAfter = `${fillAfter}${endCmt}`;
    const wordLine = `${wordLineBefore}${insertedText}${wordLineAfter}`;
    return wordLine;
}
exports.buildCommentBarLine = buildCommentBarLine;
function buildCommentBar(width, text, thickness, fillChar, commentDelims, seamlessFill = false) {
    let lines = [];
    let tmpThickness = (thickness % 2 === 0) ? (thickness + 1) : (thickness);
    let centerIdx = Math.floor(tmpThickness / 2.0);
    for (let i = 0; i < tmpThickness; ++i) {
        if (i === centerIdx) {
            lines.push(buildCommentBarLine(width, text, fillChar, commentDelims, seamlessFill));
        }
        else {
            lines.push(buildCommentBarLine(width, null, fillChar, commentDelims, seamlessFill));
        }
    }
    return lines;
}
exports.buildCommentBar = buildCommentBar;
function insertCommentBar(lines, editor, selection) {
    return __awaiter(this, void 0, void 0, function* () {
        yield editor.edit((editBuilder) => {
            editBuilder.replace(selection, _.join(lines, '\n'));
        });
    });
}
function commentBarGenerateCommand(advanced) {
    return __awaiter(this, void 0, void 0, function* () {
        let editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            vscode_1.window.showErrorMessage("There must be an active file to use this command!");
            return;
        }
        let config = vscode_1.workspace.getConfiguration('commentbars');
        let thickness = 0;
        let width = 0;
        let fillChar = '';
        let seamlessFill = false;
        let defaultFillChar = null;
        let languageId = editor.document.languageId;
        let commentDelimsOrError = Delims.processCommentDelimsConfig(config, languageId);
        if (!Delims.isLanguageDelimsConfig(commentDelimsOrError)) {
            vscode_1.window.showErrorMessage(commentDelimsOrError);
            return;
        }
        let text = null;
        let edtSelection = editor.selection;
        if (edtSelection.isEmpty) {
            text = '';
        }
        else {
            if (edtSelection.isSingleLine) {
                text = editor.document.getText(edtSelection);
            }
            else {
                vscode_1.window.showErrorMessage("Multi-line comment bar text is not supported!");
                return;
            }
        }
        // ------------- Pick comment bar thickness -------------
        if (advanced) {
            let thickOpts = {
                prompt: "Enter comment bar thickness (by number of lines):",
                placeHolder: "Enter thickness in # of lines (Will be rounded to an ODD number)"
            };
            let thicknessChoice = yield vscode_1.window.showInputBox(thickOpts);
            if (!thicknessChoice) {
                return;
            }
            thickness = Number(thicknessChoice);
            // ------------- Pick comment bar width ------------- 
            let widthOpts = {
                prompt: "Enter the the width of the comment bar (by number of characters)"
            };
            let widthInput = yield vscode_1.window.showInputBox(widthOpts);
            width = Number(widthInput);
            if (isNaN(width)) {
                vscode_1.window.showErrorMessage("Comment bar width must be a number!");
                return;
            }
            if (config.has('defaultFillChar')) {
                defaultFillChar = config.get('defaultFillChar');
            }
            let fillOpts = {
                prompt: "Enter the fill character (Default can be set in preferences)"
            };
            let fillCharInput = yield vscode_1.window.showInputBox(fillOpts);
            fillChar = (fillCharInput && fillCharInput.length === 1) ? (fillCharInput) : (defaultFillChar ? defaultFillChar : '-');
        }
        else {
            let styleOpts = {
                placeHolder: "Choose comment bar style preset (by number of lines):"
            };
            let presetsConfig = Presets.getCommentBarPresets(config);
            if (_.isArray(presetsConfig) && presetsConfig.length > 0) {
                let items = _.map(presetsConfig, (preset) => {
                    let tmpWidth = preset.width;
                    let tmpThickness = preset.thickness;
                    let tmpFillChar = (preset.fillChar) ? (preset.fillChar) : (defaultFillChar);
                    return {
                        label: preset.label,
                        description: `Width: ${tmpWidth} \u2014 Thickness: ${tmpWidth} \u2014 Fill Character: '${tmpFillChar}'`
                    };
                });
                let styleChoice = yield vscode_1.window.showQuickPick(items, styleOpts);
                let presetIdx = _.findIndex(presetsConfig, (value, index, collection) => {
                    if (styleChoice) {
                        if (value.label === styleChoice.label) {
                            return true;
                        }
                    }
                    return false;
                });
                if (presetIdx >= 0) {
                    let preset = presetsConfig[presetIdx];
                    width = preset.width;
                    thickness = preset.thickness;
                    fillChar = preset.fillChar;
                    seamlessFill = (_.isBoolean(preset.seamlessFill)) ? (preset.seamlessFill) : (false);
                }
            }
        }
        if (config.has('defaultFillChar')) {
            defaultFillChar = config.get('defaultFillChar');
        }
        if (commentDelimsOrError && fillChar && (text !== null)) {
            let lines = buildCommentBar(width, text, thickness, fillChar, commentDelimsOrError, seamlessFill);
            if (lines) {
                yield insertCommentBar(lines, editor, edtSelection);
            }
        }
        else {
            vscode_1.window.showErrorMessage("Invalid config!");
        }
    });
}
exports.commentBarGenerateCommand = commentBarGenerateCommand;
//# sourceMappingURL=generateBar.js.map