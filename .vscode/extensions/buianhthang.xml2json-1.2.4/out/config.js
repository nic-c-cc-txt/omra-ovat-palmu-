"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const options = [
    'attrkey',
    'charkey',
    'explicitCharkey',
    'trim',
    'normalizeTags',
    'normalize',
    'explicitRoot',
    'emptyTag',
    'explicitArray',
    'ignoreAttrs',
    'mergeAttrs',
    'validator',
    'xmlns',
    'explicitChildren',
    'childkey',
    'preserveChildrenOrder',
    'charsAsChildren',
    'includeWhiteChars',
    'async',
    'strict',
    'attrNameProcessors',
    'attrValueProcessors',
    'tagNameProcessors',
    'valueProcessors'
];
class ConfigReader {
    // private _readConfig<T>(key: string): T {
    //     return vscode.workspace.getConfiguration('xml2json').get<T>(key)
    // }
    get defaultSettings() {
        return vscode.workspace.getConfiguration('xml2json').get('defaultSettings');
    }
    get custom() {
        const config = {};
        const customConfig = vscode.workspace.getConfiguration('xml2json.options');
        options.forEach(key => {
            const val = customConfig.get(key);
            if (val) {
                config[key] = val;
            }
        });
        return config;
    }
    get xmlbuilder() {
        return {
            charkey: '#text',
            explicitArray: false,
            mergeAttrs: true,
            attrNameProcessors: [str => `@${str}`]
        };
    }
}
exports.Config = new ConfigReader();
//# sourceMappingURL=config.js.map