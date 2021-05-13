"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.BigNumber = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
exports.BigNumber = bignumber_js_1.default;
exports.default = bignumber_js_1.default;
bignumber_js_1.default.prototype.isBetween = function (min, max) {
    const gt = this.isGreaterThanOrEqualTo(min);
    const lt = this.isLessThanOrEqualTo(max);
    return gt && lt;
};
bignumber_js_1.default.prototype.limit = function (min, max) {
    const lt = this.lt(min);
    const gt = this.gt(max);
    if (lt) {
        return new bignumber_js_1.default(min);
    }
    else if (gt) {
        return new bignumber_js_1.default(max);
    }
    return this;
};
//# sourceMappingURL=BigNumber.js.map