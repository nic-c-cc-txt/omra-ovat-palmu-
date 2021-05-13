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
const Code = __importStar(require("vscode"));
const Debug_1 = __importDefault(require("~/Debug"));
const Config_1 = __importDefault(require("~/Config"));
const Commands_1 = __importDefault(require("~/Commands"));
class Incrementor {
    constructor(context) {
        this.namespace = 'incrementor';
        this.context = context;
        this.commands = new Commands_1.default(this);
        this.config = new Config_1.default(this);
        this.debug = new Debug_1.default(this);
        this.activate();
    }
    get activeTextEditor() {
        return Code.window.activeTextEditor;
    }
    activate() {
        this.debug.debug('Extension activated.');
        this.commands.register();
    }
}
exports.default = Incrementor;
//# sourceMappingURL=Incrementor.js.map