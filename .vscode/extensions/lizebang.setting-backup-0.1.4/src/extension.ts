import * as vscode from 'vscode';
import { Environment } from './environment';
import { BackupService } from './backup';
import { Commons } from './commons';

export function activate(context: vscode.ExtensionContext) {
  Commons.initCommons();

  const pathTool = require('path');
  let environment = new Environment(context);
  let savePath = vscode.workspace
    .getConfiguration('setting-backup')
    .get('path');
  if (!savePath) {
    savePath = pathTool.join(
      process.env.HOME || process.env.USERPROFILE,
      'vscode-settings.zip'
    );
  }

  let backupSettings = vscode.commands.registerCommand(
    'extension.settingBackupSettings',
    () => {
      BackupService.backupSettings(savePath, environment, Commons.outPut);
    }
  );

  let restoreSettings = vscode.commands.registerCommand(
    'extension.settingRestoreSettings',
    async () => {
      BackupService.restoreSettings(savePath, environment, Commons.outPut);
    }
  );

  context.subscriptions.push(backupSettings);
  context.subscriptions.push(restoreSettings);
}

export function deactivate() {}
