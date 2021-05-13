"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DelphiFormatter {
    constructor() {
        this.formatToSQL = (text) => {
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
        this.formatToString = (text) => {
            return `'{$text.replace("'", "''")} ' +`;
        };
        this.regexs = [
            new RegExp("^\\s*'"),
            new RegExp("\\s*'\\s*;$"),
            new RegExp("\\s*'\\s*\\+$"),
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
//# sourceMappingURL=delphi.js.map