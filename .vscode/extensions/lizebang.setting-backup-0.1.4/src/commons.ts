import * as vscode from 'vscode';

export class Commons {
  public static outPutChannel: vscode.OutputChannel;
  public static initCommons() {
    Commons.outPutChannel = vscode.window.createOutputChannel('Setting-Backup');
  }
  public static outPut(msg: string, show: boolean = false) {
    if (!Commons.outPutChannel) {
      Commons.initCommons();
    }
    Commons.outPutChannel.appendLine(msg);
    Commons.outPutChannel.show(show);
  }
}
