"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeType = void 0;
const Code = __importStar(require("vscode"));
const XRegExp = __importStar(require("xregexp"));
var RangeType;
(function (RangeType) {
    RangeType["Number"] = "number";
    RangeType["Enum"] = "enum";
})(RangeType = exports.RangeType || (exports.RangeType = {}));
class WordRange {
    constructor(adjustment, selection) {
        this.bounds = /[-\w#%.]+/;
        this.value = '';
        this.adjustment = adjustment;
        this.selection =
            selection instanceof Code.Selection
                ? selection
                : new Code.Selection(selection.start, selection.end);
        this.regexes = this.getRegexPatterns();
        this.range = this.getWordRange();
        this.value = this.getValue();
        this.type = this.getType();
    }
    get editor() {
        return this.adjustment.editor;
    }
    get regex() {
        if (this.type) {
            return this.regexes[this.type];
        }
    }
    getRegexPatterns() {
        return {
            number: XRegExp.cache(`^
                (?<number>
                    (?<sign> [-] )?
                    (?<digits> \\d+ )
                    (?: \\. (?<decimals> \\d+ ) )?
                )
                (?<suffix> [a-zA-Z%]* )
                $`, 'x'),
            enum: XRegExp.cache('^[a-zA-Z](?:-?\\w+)*$'),
        };
    }
    getWordRange() {
        const range = this.editor.document.getWordRangeAtPosition(this.selection.active, this.bounds);
        if (this.selection.isEmpty && range) {
            return range;
        }
        return this.selection;
    }
    getValue() {
        return this.editor.document.getText(this.range);
    }
    getType() {
        let type;
        for (const key in RangeType) {
            const typeToCheck = RangeType[key];
            if (this.validate(typeToCheck)) {
                type = typeToCheck;
                break;
            }
        }
        return type;
    }
    validate(type) {
        switch (type) {
            case RangeType.Number:
                return this.validateNumber();
            case RangeType.Enum:
                return this.validateEnum();
            default:
                return false;
        }
    }
    validateNumber() {
        return XRegExp.test(this.value, this.regexes.number);
    }
    validateEnum() {
        var _a;
        const test = XRegExp.test(this.value, this.regexes.enum);
        const enums = this.adjustment.config.enums.values;
        const included = (_a = enums === null || enums === void 0 ? void 0 : enums.some((e) => e.includes(this.value))) !== null && _a !== void 0 ? _a : false;
        return test && included;
    }
}
exports.default = WordRange;
//# sourceMappingURL=WordRange.js.map