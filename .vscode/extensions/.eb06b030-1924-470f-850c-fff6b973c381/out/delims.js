"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function isLanguageDelimsConfig(configOrError) {
    return (typeof configOrError !== "string") && (configOrError.start !== undefined);
}
exports.isLanguageDelimsConfig = isLanguageDelimsConfig;
function processCommentDelimsConfig(config, languageId) {
    let commentDelimsFallback = null;
    let commentDelimsUser = null;
    if (config.has('commentDelimsFallback')) {
        commentDelimsFallback = config.get('commentDelimsFallback');
        if (!commentDelimsFallback) {
            return "Failed to read the `commentbars.commentDelimsFallback` setting!";
        }
    }
    else {
        return "Could not find the `commentbars.commentDelimsFallback` setting!";
    }
    if (config.has('commentDelimsUser')) {
        commentDelimsUser = config.get('commentDelimsUser');
        if (!commentDelimsUser) {
            return "Failed to read the `commentbars.commentDelimsUser` setting!";
        }
    }
    else {
        return "Could not find the `commentbars.commentDelimsUser` setting!";
    }
    const commentDelims = _.assign({}, commentDelimsFallback, commentDelimsUser);
    if (languageId in commentDelims) {
        return commentDelims[languageId];
    }
    else {
        return "Unsupported language!";
    }
}
exports.processCommentDelimsConfig = processCommentDelimsConfig;
//# sourceMappingURL=delims.js.map