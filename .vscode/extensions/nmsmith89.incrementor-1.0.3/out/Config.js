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
const Code = __importStar(require("vscode"));
const lodash_es_1 = require("lodash-es");
class Config {
    constructor(extension) {
        this.extension = extension;
        const get = this.get.bind(this);
        this.numbers = {
            ones: {
                get incrementValue() {
                    return get('numbers.ones.incrementValue');
                },
                get decrementValue() {
                    return get('numbers.ones.decrementValue');
                },
            },
            tenths: {
                get incrementValue() {
                    return get('numbers.tenths.incrementValue');
                },
                get decrementValue() {
                    return get('numbers.tenths.decrementValue');
                },
            },
            tens: {
                get incrementValue() {
                    return get('numbers.tens.incrementValue');
                },
                get decrementValue() {
                    return get('numbers.tens.decrementValue');
                },
            },
            get decimalPlaces() {
                return get('numbers.decimalPlaces');
            },
        };
        this.enums = {
            get loop() {
                return get('enums.loop');
            },
            get values() {
                return get('enums.values');
            },
        };
    }
    get settings() {
        var _a;
        return Code.workspace.getConfiguration(this.extension.namespace, (_a = this.extension.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document);
    }
    get enabled() {
        return this.get('enabled');
    }
    all() {
        return {
            enabled: this.get('enabled'),
            numbers: {
                ones: {
                    incrementValue: this.get('numbers.ones.incrementValue'),
                    decrementValue: this.get('numbers.ones.decrementValue'),
                },
                tenths: {
                    incrementValue: this.get('numbers.tenths.incrementValue'),
                    decrementValue: this.get('numbers.tenths.decrementValue'),
                },
                tens: {
                    incrementValue: this.get('numbers.tens.incrementValue'),
                    decrementValue: this.get('numbers.tens.decrementValue'),
                },
            },
            enums: {
                loop: this.get('enums.loop'),
                values: this.get('enums.values'),
            },
        };
    }
    get(setting) {
        const override = lodash_es_1.get(this.overrides, setting);
        return override !== null && override !== void 0 ? override : this.settings.get(setting);
    }
    set(setting, value) {
        let successful;
        try {
            void this.settings.update(setting, value, true);
            successful = true;
        }
        catch (error) {
            successful = false;
        }
        return successful;
    }
    setOverrides(overrides) {
        this.overrides = Object.assign({}, overrides);
    }
    getOverrides() {
        return this.overrides;
    }
    clearOverrides() {
        this.overrides = undefined;
    }
}
exports.default = Config;
//# sourceMappingURL=Config.js.map