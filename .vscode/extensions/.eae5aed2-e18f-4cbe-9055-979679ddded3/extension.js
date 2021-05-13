// @ts-nocheck
const decoration = require('./out/decoration.pst.js');
const calculation = require('./out/calculation.pst.js');
const curvereader = require('./out/curveReader.pst.js');
var vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
const opc = vscode.window.createOutputChannel('PowerSystemTools');
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('"PowerSystemTools"插件启动成功!');
    decoration.activate(context, opc);
    calculation.activate(context, opc);
    curvereader.activate(context, opc);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    console.log('"PowerSystemTools"插件关闭!');
}

module.exports = {
    activate,
    deactivate
};
