"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.subscriptions.push(vscode.commands.registerCommand('psl.stepIn', stepIn));
        context.subscriptions.push(vscode.commands.registerCommand('psl.stepOut', stepOut));
        context.subscriptions.push(vscode.commands.registerCommand('psl.stepOver', stepOver));
        context.subscriptions.push(vscode.commands.registerCommand('psl.sendToHostTerminal', sendToHostTerminal));
        terminalSendSettings();
        configureGtmDebug(context);
    });
}
exports.activate = activate;
function terminalSendSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        const pslTerminalCommands = ['psl.stepIn', 'psl.stepOut', 'psl.stepOver', 'psl.sendToHostTerminal'];
        const terminalSettings = vscode.workspace.getConfiguration('terminal');
        const commandsToSkip = terminalSettings.get('integrated.commandsToSkipShell');
        if (commandsToSkip) {
            const merged = commandsToSkip.concat(pslTerminalCommands);
            const filteredMerge = merged.filter((item, pos) => merged.indexOf(item) === pos);
            terminalSettings.update('integrated.commandsToSkipShell', filteredMerge, true);
        }
    });
}
function stepIn() {
    terminalSend('ZSTEP INTO:"W $ZPOS,! ZP @$ZPOS B"');
}
function stepOut() {
    terminalSend('ZSTEP OUTOF:"W $ZPOS,! ZP @$ZPOS B"');
}
function stepOver() {
    terminalSend('ZSTEP OVER:"W $ZPOS,! ZP @$ZPOS B"');
}
function sendToHostTerminal(text) {
    terminalSend(text);
}
function terminalSend(text) {
    const activeTerminal = vscode.window.activeTerminal;
    if (activeTerminal) {
        activeTerminal.show();
        activeTerminal.sendText(text, true);
    }
}
function configureGtmDebug(context) {
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 901);
    const commandName = 'psl.setGtmDebug';
    let gtmDebug = vscode.workspace.getConfiguration('psl').get('gtmDebugEnabled');
    const set = () => {
        if (gtmDebug)
            showInformation(context);
        statusBar.text = `GT.M Debug ${gtmDebug ? '$(check)' : '$(circle-slash)'}`;
        vscode.commands.executeCommand('setContext', 'psl.gtmDebug', gtmDebug);
    };
    set();
    context.subscriptions.push(vscode.commands.registerCommand(commandName, () => {
        gtmDebug = !gtmDebug;
        set();
    }));
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('psl.gtmDebugEnabled')) {
            gtmDebug = true;
            set();
        }
    });
    statusBar.command = commandName;
    statusBar.tooltip = 'GT.M Debug hotkeys';
    statusBar.show();
}
function showInformation(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const doNotShow = context.globalState.get('gtmDebugShow');
        if (doNotShow)
            return;
        const response = yield vscode.window.showInformationMessage('INTO Ctrl+Q | OVER Ctrl+W | OUTOF Ctrl+E', 'Do not show again');
        if (response) {
            context.globalState.update('gtmDebugShow', true);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3Rlcm1pbmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBRWpDLFNBQXNCLFFBQVEsQ0FBQyxPQUFnQzs7UUFFOUQsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQ3pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUM5QixZQUFZLEVBQUUsTUFBTSxDQUNwQixDQUNELENBQUM7UUFFRixPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDekIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQzlCLGFBQWEsRUFBRSxPQUFPLENBQ3RCLENBQ0QsQ0FBQztRQUVGLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUN6QixNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FDOUIsY0FBYyxFQUFFLFFBQVEsQ0FDeEIsQ0FDRCxDQUFDO1FBRUYsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQ3pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUM5Qix3QkFBd0IsRUFBRSxrQkFBa0IsQ0FDNUMsQ0FDRCxDQUFDO1FBQ0Ysb0JBQW9CLEVBQUUsQ0FBQztRQUV2QixpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QixDQUFDO0NBQUE7QUE1QkQsNEJBNEJDO0FBRUQsU0FBZSxvQkFBb0I7O1FBQ2xDLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3BHLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RSxNQUFNLGNBQWMsR0FBeUIsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDcEcsSUFBSSxjQUFjLEVBQUU7WUFD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