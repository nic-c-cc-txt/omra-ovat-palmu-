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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustmentAmount = exports.AdjustmentDirection = void 0;
const Code = __importStar(require("vscode"));
const xregexp_1 = __importDefault(require("xregexp"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const WordRange_1 = __importStar(require("~/WordRange"));
var AdjustmentDirection;
(function (AdjustmentDirection) {
    AdjustmentDirection[AdjustmentDirection["DECREMENT"] = -1] = "DECREMENT";
    AdjustmentDirection[AdjustmentDirection["INCREMENT"] = 1] = "INCREMENT";
})(AdjustmentDirection = exports.AdjustmentDirection || (exports.AdjustmentDirection = {}));
var AdjustmentAmount;
(function (AdjustmentAmount) {
    AdjustmentAmount[AdjustmentAmount["TENTHS"] = 0] = "TENTHS";
    AdjustmentAmount[AdjustmentAmount["ONES"] = 1] = "ONES";
    AdjustmentAmount[AdjustmentAmount["TENS"] = 2] = "TENS";
})(AdjustmentAmount = exports.AdjustmentAmount || (exports.AdjustmentAmount = {}));
class Adjustment {
    constructor(extension, direction, amount, textEditor, edit) {
        this.extension = extension;
        this.direction = direction;
        this.amount = amount;
        this.editor = textEditor;
        this.edit = edit;
        this.setting = this.parseSetting();
        this.delta = this.getDelta();
        this.apply();
    }
    get config() {
        return this.extension.config;
    }
    static createCommand(extension, direction, amount) {
        return (textEditor, edit, configOverrides) => {
            if (configOverrides !== undefined) {
                extension.config.setOverrides(configOverrides);
            }
            else {
                extension.config.clearOverrides();
            }
            new Adjustment(extension, direction, amount, textEditor, edit);
        };
    }
    parseSetting() {
        const direction = this.direction === AdjustmentDirection.DECREMENT ? 'decrement' : 'increment';
        let amount = '';
        switch (this.amount) {
            case AdjustmentAmount.TENS:
                amount = 'tens';
                break;
            case AdjustmentAmount.TENTHS:
                amount = 'tenths';
                break;
            case AdjustmentAmount.ONES:
            default:
                amount = 'ones';
                break;
        }
        return `numbers.${amount}.${direction}Value`;
    }
    getDelta() {
        return this.config.get(this.setting);
    }
    createSelection(range, inverted = false) {
        const anchor = inverted ? range.end : range.start;
        const active = inverted ? range.start : range.end;
        return new Code.Selection(anchor, active);
    }
    loopArrayIndex(index, length) {
        while (index < 0) {
            index += length;
        }
        return index % length;
    }
    adjustNumber(wordRange) {
        var _a, _b, _c, _d;
        if (wordRange.regex === undefined) {
            return wordRange.value;
        }
        const regex = xregexp_1.default.exec(wordRange.value, wordRange.regex);
        const roundDigits = (_a = this.config.numbers.decimalPlaces) !== null && _a !== void 0 ? _a : -1;
        let number = new bignumber_js_1.default((_b = regex === null || regex === void 0 ? void 0 : regex.number) !== null && _b !== void 0 ? _b : 0);
        number = number.plus((_c = this.delta) !== null && _c !== void 0 ? _c : 0);
        if (roundDigits > -1) {
            number = number.decimalPlaces(roundDigits);
        }
        return number.toString() + ((_d = regex === null || regex === void 0 ? void 0 : regex.suffix) !== null && _d !== void 0 ? _d : '');
    }
    adjustEnum(wordRange) {
        var _a, _b;
        const enums = this.config.enums.values;
        const currentEnum = enums === null || enums === void 0 ? void 0 : enums.find((value) => value.includes(wordRange.value));
        const index = (_a = currentEnum === null || currentEnum === void 0 ? void 0 : currentEnum.indexOf(wordRange.value)) !== null && _a !== void 0 ? _a : -1;
        const delta = ((_b = this.delta) !== null && _b !== void 0 ? _b : 1) < 0 ? -1 : 1;
        if (index < 0 || currentEnum === undefined) {
            return wordRange.value;
        }
        let nextIndex = index + delta;
        if (this.config.enums.loop) {
            nextIndex = this.loopArrayIndex(nextIndex, currentEnum.length);
        }
        else {
            nextIndex = nextIndex < currentEnum.length && nextIndex >= 0 ? nextIndex : index;
        }
        return currentEnum[nextIndex];
    }
    apply() {
        this.editor.selections = this.editor.selections.map((selection) => {
            const wordRange = new WordRange_1.default(this, selection);
            let result = wordRange.value;
            if (wordRange.type == WordRange_1.RangeType.Number) {
                result = this.adjustNumber(wordRange);
            }
            else if (wordRange.type == WordRange_1.RangeType.Enum) {
                result = this.adjustEnum(wordRange);
            }
            if (result !== undefined && result !== wordRange.value && !wordRange.range.isEmpty) {
                this.edit.replace(wordRange.range, result);
                const inverted = !selection.isEmpty && selection.isReversed;
                return this.createSelection(wordRange.range, inverted);
            }
            return selection;
        });
    }
}
exports.default = Adjustment;
//# sourceMappingURL=Adjustment.js.map