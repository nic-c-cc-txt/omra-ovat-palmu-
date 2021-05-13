"use strict";
/*import * as vscode from 'vscode';

let g_context: vscode.ExtensionContext = null;
let g_terminal: vscode.Terminal = null;

function startConsoleCommand() {
    startConsole(false);
}

async export function startConsole(preserveFocus: boolean) {
    if (g_terminal === null) {
        let AMPLIsConnectedPromise = startConsoleMsgServer()
        let exepath = await AMPLexepath.getAMPLExePath()
        g_terminal = vscode.window.createTerminal(
            {
                name: "AMPL",
                shellPath: exepath
            }
        );
        g_terminal.show(preserveFocus);
        await AMPLIsConnectedPromise;
    }
    else {
        g_terminal.show(preserveFocus);
    }
}

function startConsoleMsgServer() {
    let PIPE_PATH = generatePipeName(process.pid.toString(), 'vscode-language-ampl-fromconsole')

    let connectedPromise = new Promise(function (resolveCallback, rejectCallback) {
        var server = net.createServer(function (socket) {
            resolveCallback();

            let accumulatingBuffer = new Buffer(0);
            socket.on('data', function (c) {
                accumulatingBuffer = Buffer.concat([accumulatingBuffer, Buffer.from(c)]);
                let s = accumulatingBuffer.toString();
                let index_of_sep_1 = s.indexOf(":");
            })
        });
    });

}

function executeFile() {
    var editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    let document = editor.document;

}

function executeInConsol(code: string, filename: string, start: vscode.Position) {
    let msg = filename + '\n' + start.line.toString() + ':' +
        start.character.toString() + '\n' + code;
    sendMessage('repl/runcode', msg)
}

*/ 
//# sourceMappingURL=console.js.map