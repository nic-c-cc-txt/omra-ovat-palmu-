"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts .gitignore lines to vscode-style ignore pattern
 *
 * @export
 * @class PatternConverter
 */
class PatternConverter {
    /**
     * Convert a Gitignore to a Pattern[]
     *
     * @param {Gitignore} gitgnore
     * @returns {Pattern[]}
     * @memberof PatternConverter
     */
    convert(gitignore) {
        return gitignore.lines
            .map((line) => this._convertToPattern(line, gitignore.path))
            .filter((line) => line !== void 0);
    }
    /**
     * Convert single .gitignore line to vscode-style pattern
     *
     * @private
     * @param {string} line
     * @param {string} path
     * @returns {(Pattern | void)}
     * @memberof PatternConverter
     */
    _convertToPattern(line, path) {
        if (this._canBeIgnored(line)) {
            return;
        }
        let text = line;
        const isNegated = text.startsWith('!');
        const hide = !isNegated;
        if (isNegated) {
            text = text.substr(1);
        }
        let glob = text;
        if (text.startsWith('/')) {
            glob = text.substr(1);
        }
        else if (!text.startsWith('**') &&
            (text.indexOf('/') < 0 || text.endsWith('/'))) {
            glob = `**/${glob}`;
        }
        // prefix with path
        glob = path !== '.' ? `${path}/${glob}` : glob;
        return { glob, hide, line };
    }
    /**
     * Check if the given line does not need to be converted
     *
     * @private
     * @param {string} line
     * @returns {boolean}
     * @memberof PatternConverter
     */
    _canBeIgnored(line) {
        return line.indexOf('#') === 0 || line.length < 1;
    }
}
exports.PatternConverter = PatternConverter;
//# sourceMappingURL=pattern-converter.js.map