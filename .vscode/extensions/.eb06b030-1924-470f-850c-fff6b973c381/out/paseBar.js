"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commentBarRegexp = /^(?:(?:\S){1,10}(?:\s?))(\S)\1*\s(\b.+\b)\s(\S)\1*(?:(?:\s?)(?:\S){1,10})?$/;
function parseCommentBarLine(line) {
    let tmpLine = line.trim();
    let m = tmpLine.match(commentBarRegexp);
    if (m !== null) {
        return {
            fillChar: m[1],
            text: m[2],
            width: tmpLine.length
        };
    }
    return null;
}
exports.parseCommentBarLine = parseCommentBarLine;
//# sourceMappingURL=paseBar.js.map