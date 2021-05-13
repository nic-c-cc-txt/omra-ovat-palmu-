"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const compileAndLink_1 = require("./compileAndLink");
const get_1 = require("./get");
const refresh_1 = require("./refresh");
const run_1 = require("./run");
const runCustom_1 = require("./runCustom");
const send_1 = require("./send");
const testCompile_1 = require("./testCompile");
const PROFILE_ELEMENTS = [
    '.FKY',
    '.G',
    '.IDX',
    '.JFD',
    '.M',
    '.m',
    '.PPL',
    '.properties',
    '.PROPERTIES',
    '.PSLX',
    '.pslx',
    '.PSLXTRA',
    '.pslxtra',
    '.PSQL',
    '.psql',
    '.QRY',
    '.RPT',
    '.SCR',
];
function activate(context) {
    registerProfileElementContext();
    runCustom_1.registerCustomRunContext();
    const commands = [
        { id: 'psl.getElement', callback: get_1.getElementHandler },
        { id: 'psl.getTable', callback: get_1.getTableHandler },
        { id: 'psl.refreshElement', callback: refresh_1.refreshElementHandler },
        { id: 'psl.sendElement', callback: send_1.sendElementHandler },
        { id: 'psl.testCompile', callback: testCompile_1.testCompileHandler },
        { id: 'psl.compileAndLink', callback: compileAndLink_1.compileAndLinkHandler },
        { id: 'psl.runPSL', callback: run_1.runPSLHandler },
        { id: 'psl.sendTable', callback: send_1.sendTableHandler },
        { id: 'psl.refreshTable', callback: refresh_1.refreshTableHandler },
        // Custom commands
        // { id: 'psl.getCompiledCode', callback: getCompiledCodeHandler },
        { id: `psl.${runCustom_1.testContext.command}`, callback: runCustom_1.runTestHandler },
        { id: `psl.${runCustom_1.coverageContext.command}`, callback: runCustom_1.runCoverageHandler },
    ];
    for (const command of commands) {
        context.subscriptions.push(vscode.commands.registerCommand(command.id, command.callback));
    }
}
exports.activate = activate;
function registerProfileElementContext() {
    if (vscode.window.activeTextEditor)
        setIsProfileElementContext(vscode.window.activeTextEditor);
    vscode.window.onDidChangeActiveTextEditor(setIsProfileElementContext);
}
function setIsProfileElementContext(textEditor) {
    let isElement = false;
    if (textEditor) {
        isElement = PROFILE_ELEMENTS.indexOf(path.extname(textEditor.document.fileName)) >= 0;
    }
    vscode.commands.executeCommand('setContext', 'psl.isProfileElement', isElement);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaG9zdENvbW1hbmRzL2FjdGl2YXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUVqQyxxREFBeUQ7QUFDekQsK0JBQTJEO0FBRTNELHVDQUF1RTtBQUN2RSwrQkFBc0M7QUFDdEMsMkNBR3FCO0FBQ3JCLGlDQUE4RDtBQUM5RCwrQ0FBbUQ7QUFFbkQsTUFBTSxnQkFBZ0IsR0FBRztJQUN4QixNQUFNO0lBQ04sSUFBSTtJQUNKLE1BQU07SUFDTixNQUFNO0lBQ04sSUFBSTtJQUNKLElBQUk7SUFDSixNQUFNO0lBQ04sYUFBYTtJQUNiLGFBQWE7SUFDYixPQUFPO0lBQ1AsT0FBTztJQUNQLFVBQVU7SUFDVixVQUFVO0lBQ1YsT0FBTztJQUNQLE9BQU87SUFDUCxNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07Q0FDTixDQUFDO0FBRUYsU0FBZ0IsUUFBUSxDQUFDLE9BQWdDO0lBRXhELDZCQUE2QixFQUFFLENBQUM7SUFDaEMsb0NBQXdCLEVBQUUsQ0FBQztJQUUzQixNQUFNLFFBQVEsR0FBRztRQUNoQixFQUFFLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsdUJBQWlCLEVBQUU7UUFDckQsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxxQkFBZSxFQUFFO1FBQ2pELEVBQUUsRUFBRSxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSwrQkFBcUIsRUFBRTtRQUM3RCxFQUFFLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUseUJBQWtCLEVBQUU7UUFDdkQsRUFBRSxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLGdDQUFrQixFQUFFO1FBQ3ZELEVBQUUsRUFBRSxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxzQ0FBcUIsRUFBRTtRQUM3RCxFQUFFLEVBQUUsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLG1CQUFhLEVBQUU7UUFDN0MsRUFBRSxFQUFFLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSx1QkFBZ0IsRUFBRTtRQUNuRCxFQUFFLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsNkJBQW1CLEVBQUU7UUFDekQsa0JBQWtCO1FBQ2xCLG1FQUFtRTtRQUNuRSxFQUFFLEVBQUUsRUFBRSxPQUFPLHVCQUFXLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLDBCQUFjLEVBQUU7UUFDOUQsRUFBRSxFQUFFLEVBQUUsT0FBTywyQkFBZSxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSw4QkFBa0IsRUFBRTtLQUN0RSxDQUFDO0lBRUYsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7UUFDL0IsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQ3pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUM5QixPQUFPLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQzVCLENBQ0QsQ0FBQztLQUNGO0FBQ0YsQ0FBQztBQTVCRCw0QkE0QkM7QUFFRCxTQUFTLDZCQUE2QjtJQUNyQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCO1FBQUUsMEJBQTBCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQy9GLE1BQU0sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUN2RSxDQUFDO0FBRUQsU0FBUywwQkFBMEIsQ0FBQyxVQUE2QjtJQUNoRSxJQUFJLFNBQVMsR0FBWSxLQUFLLENBQUM7SUFDL0IsSUFBSSxVQUFVLEVBQUU7UUFDZixTQUFTLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN0RjtJQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxzQkFBc0IsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNqRixDQUFDIn0=