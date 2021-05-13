/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { existsSync, unlinkSync, readFile, writeFile } from 'fs';
import AdmZip = require('adm-zip');
import { PluginService } from './plugin';
import { Environment } from './environment';

export class BackupService {
  public static ignornExts = ['lizebang.setting-backup'];

  public static backupSettings(
    savePath: any,
    environment: Environment,
    callback: (msg: string, show: boolean) => any
  ) {
    if (existsSync(savePath)) {
      unlinkSync(savePath);
    }
    var extendsList = BackupService.getAllExt();
    BackupService.writeFile(
      environment.FILE_EXTENSION,
      JSON.stringify(extendsList, null, 2)
    ).then((path: any) => {
      var backupZip = new AdmZip();
      backupZip.addLocalFile(path); // extension
      backupZip.addLocalFile(environment.FILE_SETTING); // settings
      backupZip.addLocalFile(environment.FILE_KEYBINDING); // keyboard
      backupZip.writeZip(savePath);
      callback('Backup Done', true);
    });
  }

  public static restoreSettings(
    savePath: any,
    environment: Environment,
    callback: (msg: string, show?: boolean) => any
  ) {
    var restoreZip = new AdmZip(savePath);
    restoreZip.extractAllTo(environment.USER_FOLDER, true); // settings keyboard extension
    BackupService.installExts(environment.FILE_EXTENSION, callback); // install extension
    BackupService.deleteExts(environment.FILE_EXTENSION, callback); // delete extension
    callback('Restore Done', true);
  }

  private static getAllExt() {
    return PluginService.GetExtensionList();
  }

  private static readAnyFile(path: string) {
    return new Promise((resolve, reject) => {
      readFile(path, 'utf8', (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(data);
      });
    });
  }

  private static writeFile(path: string, content: string) {
    return new Promise((resolve, reject) => {
      writeFile(path, content, (err: any) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(path);
      });
    });
  }

  private static installExts(
    extSetingPath: string,
    callback: (msg: string, show?: boolean) => any
  ) {
    BackupService.readAnyFile(extSetingPath).then((exts: any) => {
      PluginService.InstallExtensions(exts, BackupService.ignornExts, callback);
    });
  }

  private static deleteExts(
    extSetingPath: string,
    callback: (msg: string, show?: boolean) => any
  ) {
    BackupService.readAnyFile(extSetingPath).then((exts: any) => {
      PluginService.DeleteExtensions(exts, BackupService.ignornExts, callback);
    });
  }
}
