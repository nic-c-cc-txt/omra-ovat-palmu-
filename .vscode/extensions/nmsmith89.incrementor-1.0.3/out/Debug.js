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
exports.LogMethod = exports.LogLevel = void 0;
const Code = __importStar(require("vscode"));
const lodash_es_1 = require("lodash-es");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var LogMethod;
(function (LogMethod) {
    LogMethod["DEBUG"] = "log";
    LogMethod["INFO"] = "info";
    LogMethod["WARN"] = "warn";
    LogMethod["ERROR"] = "error";
})(LogMethod = exports.LogMethod || (exports.LogMethod = {}));
class Debug {
    constructor(extension) {
        this.extension = extension;
    }
    get isDev() {
        return this.extension.context.extensionMode === Code.ExtensionMode.Development;
    }
    post(logLevel = LogLevel.INFO, message, ...optionalParams) {
        let logMethod;
        switch (logLevel) {
            case LogLevel.ERROR:
                logMethod = LogMethod.ERROR;
                break;
            case LogLevel.INFO:
                logMethod = LogMethod.INFO;
                break;
            case LogLevel.WARN:
                logMethod = LogMethod.WARN;
                break;
            default:
                logMethod = LogMethod.DEBUG;
                break;
        }
        if (this.isDev) {
            const prefix = lodash_es_1.capitalize(this.extension.namespace) + ': ';
            const params = [];
            if (typeof message === 'string') {
                params.push(prefix + message);
            }
            else {
                params.push(prefix, message);
            }
            params.push(...optionalParams);
            console[logMethod](...params);
        }
    }
    debug(...args) {
        this.post(LogLevel.DEBUG, ...args);
    }
    info(...args) {
        this.post(LogLevel.INFO, ...args);
    }
    warn(...args) {
        this.post(LogLevel.WARN, ...args);
    }
    error(...args) {
        this.post(LogLevel.ERROR, ...args);
    }
}
exports.default = Debug;
//# sourceMappingURL=Debug.js.map