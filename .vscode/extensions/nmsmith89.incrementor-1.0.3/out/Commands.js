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
const Adjustment_1 = __importStar(require("~/Adjustment"));
class Commands {
    constructor(extension) {
        this.extension = extension;
    }
    get debug() {
        return this.extension.debug;
    }
    get config() {
        return this.extension.config;
    }
    get commandList() {
        return {
            incrementByOne: Adjustment_1.default.createCommand(this.extension, Adjustment_1.AdjustmentDirection.INCREMENT, Adjustment_1.AdjustmentAmount.ONES),
            decrementByOne: Adjustment_1.default.createCommand(this.extension, Adjustment_1.AdjustmentDirection.DECREMENT, Adjustment_1.AdjustmentAmount.ONES),
            incrementByTenth: Adjustment_1.default.createCommand(this.extension, Adjustment_1.AdjustmentDirection.INCREMENT, Adjustment_1.AdjustmentAmount.TENTHS),
            decrementByTenth: Adjustment_1.default.createCommand(this.extension, Adjustment_1.AdjustmentDirection.DECREMENT, Adjustment_1.AdjustmentAmount.TENTHS),
            incrementByTen: Adjustment_1.default.createCommand(this.extension, Adjustment_1.AdjustmentDirection.INCREMENT, Adjustment_1.AdjustmentAmount.TENS),
            decrementByTen: Adjustment_1.default.createCommand(this.extension, Adjustment_1.AdjustmentDirection.DECREMENT, Adjustment_1.AdjustmentAmount.TENS),
        };
    }
    register() {
        this.debug.debug('Registering commands...');
        Object.entries(this.commandList).forEach((args) => this.registerCommand(...args));
    }
    registerCommand(name, method) {
        const disposable = Code.commands.registerTextEditorCommand(`${this.extension.namespace}.${name}`, method, this);
        this.extension.context.subscriptions.push(disposable);
        this.debug.debug(`Command registered: '${name}'.`);
    }
    notImplemented() {
        void Code.window.showInformationMessage('Command Not Implemented Yet!');
    }
}
exports.default = Commands;
//# sourceMappingURL=Commands.js.map