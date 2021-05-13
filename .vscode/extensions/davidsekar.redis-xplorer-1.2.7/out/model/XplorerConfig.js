"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enum_1 = require("../enum");
class XplorerConfig {
    constructor() {
        this.profiles = [];
        this.scanLimit = enum_1.Constants.RedisScanLimit;
    }
}
exports.XplorerConfig = XplorerConfig;
//# sourceMappingURL=XplorerConfig.js.map