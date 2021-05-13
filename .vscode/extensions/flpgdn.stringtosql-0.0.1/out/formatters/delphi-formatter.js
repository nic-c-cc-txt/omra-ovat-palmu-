"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DelphiFormatter {
    constructor() {
        this.formatToSQL = (textLine, lineCount) => {
            let text = textLine.text;
            this.regexs.forEach(rgx => {
                if (rgx.test(text)) {
                    text = text.replace(rgx, "");
                }
            });
            text = text.replace(this.rgxSingleQuotes, "'");
            if (this.rgxLastSingleQuote.test(text) && !this.rgxLastFilter.test(text)) {
                text = text.replace(this.rgxLastSingleQuote, "");
            }
            return text;
        };
        this.formatToString = (textLine, lineCount) => {
            let text = textLine.text;
            let isLastLine = (textLine.lineNumber === (lineCount - 1));
            return `'${text.replace(/'/g, "''")} '${isLastLine ? ';' : ' +'}`;
        };
        this.regexs = [
            new RegExp("^\\s*'"),
            new RegExp("\\s*'\\s*;$"),
            new RegExp("\\s*'\\s*\\+\\s*$"),
            new RegExp("'\\s*\\+"),
            new RegExp("\\+\\s*'"),
            new RegExp("\\s+'\\s*$")
        ];
        this.rgxLastSingleQuote = new RegExp("'$");
        this.rgxLastFilter = new RegExp("'.+'$");
        this.rgxSingleQuotes = new RegExp("''", 'g');
    }
}
exports.default = DelphiFormatter;
//# sourceMappingURL=delphi-formatter.js.map