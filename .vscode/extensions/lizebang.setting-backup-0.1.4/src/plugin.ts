'use strict';
import * as vscode from 'vscode';

export class ExtensionMetadata {
  constructor(
    public galleryApiUrl: string,
    public id: string,
    public downloadUrl: string,
    public publisherId: string,
    public publisherDisplayName: string,
    public date: string
  ) {}
}

export class ExtensionInformation {
  public static fromJSON(text: string) {
    try {
      // TODO: JSON.parse may throw error
      // Throw custom error should be more friendly
      const obj = JSON.parse(text);
      const meta = new ExtensionMetadata(
        obj.meta.galleryApiUrl,
        obj.meta.id,
        obj.meta.downloadUrl,
        obj.meta.publisherId,
        obj.meta.publisherDisplayName,
        obj.meta.date
      );
      const item = new ExtensionInformation();
      item.metadata = meta;
      item.name = obj.name;
      item.publisher = obj.publisher;
      item.version = obj.version;
      return item;
    } catch (err) {
      throw new Error(err);
    }
  }

  public static fromJSONList(text: string) {
    const extList: ExtensionInformation[] = [];
    try {
      // TODO: JSON.parse may throw error
      // Throw custom error should be more friendly
      var list = null;
      if (typeof text === 'string') {
        list = JSON.parse(text);
      } else {
        list = text;
      }
      list.forEach((obj: any) => {
        const meta = new ExtensionMetadata(
          obj.metadata.galleryApiUrl,
          obj.metadata.id,
          obj.metadata.downloadUrl,
          obj.metadata.publisherId,
          obj.metadata.publisherDisplayName,
          obj.metadata.date
        );
        const item = new ExtensionInformation();
        item.metadata = meta;
        item.name = obj.name;
        item.publisher = obj.publisher;
        item.version = obj.version;
        console.log(`extension name -${item.name}`);
        if (item.name !== 'setting-backup') {
          extList.push(item);
        }
      });
    } catch (err) {
      throw new Error(err);
    }

    return extList;
  }

  public metadata: ExtensionMetadata | undefined;
  public name!: string | '';
  public version!: string | '';
  public publisher!: string | '';
}

export class PluginService {
  public static GetExtensionList() {
    return vscode.extensions.all
      .filter((ext) => !ext.packageJSON.isBuiltin)
      .map((ext) => {
        const meta = ext.packageJSON.__metadata || {
          id: ext.packageJSON.uuid,
          publisherId: ext.id,
          publisherDisplayName: ext.packageJSON.publisher,
        };
        const data = new ExtensionMetadata(
          meta.galleryApiUrl,
          meta.id,
          meta.downloadUrl,
          meta.publisherId,
          meta.publisherDisplayName,
          meta.date
        );
        const info = new ExtensionInformation();
        info.metadata = data;
        info.name = ext.packageJSON.name;
        info.publisher = ext.packageJSON.publisher;
        info.version = ext.packageJSON.version;
        return info;
      });
  }

  public static async InstallExtensions(
    extensions: string,
    ignoredExtensions: string[],
    callback: (msg: string, show?: boolean) => void
  ): Promise<ExtensionInformation[]> {
    let installedExtensions: ExtensionInformation[] = [];
    const toInstallExtensions = PluginService.GetExtensionsToInstall(
      extensions,
      ignoredExtensions
    );
    if (toInstallExtensions.length === 0) {
      callback('Setting Backup: No Extensions needs to be installed.');
      return [];
    }
    installedExtensions = await PluginService.InstallExtensionsAPI(
      toInstallExtensions,
      callback
    );

    return installedExtensions;
  }

  private static GetExtensionsToInstall(
    extensions: string,
    ignoredExtensions: string[]
  ) {
    const extensionList = ExtensionInformation.fromJSONList(extensions);
    const localList = this.GetExtensionList();
    return extensionList.filter(
      (ext) =>
        !ignoredExtensions.includes(ext.name) &&
        !localList.map((e) => e.name).includes(ext.name)
    );
  }

  private static async InstallExtensionsAPI(
    toInstallExtensions: ExtensionInformation[],
    callback: (msg: string, show?: boolean) => void
  ) {
    const installedExtensions: ExtensionInformation[] = [];
    const missingExtensionsCount = toInstallExtensions.length;
    callback('TOTAL EXTENSIONS TO INSTALL: ' + missingExtensionsCount);
    callback('');
    callback('');
    for (const ext of toInstallExtensions) {
      const name = ext.publisher + '.' + ext.name;
      try {
        callback('');
        callback(`[x] - EXTENSION: ${ext.name} - INSTALLING`);
        await vscode.commands.executeCommand(
          'workbench.extensions.installExtension',
          name
        );
        callback('');
        callback(`[x] - EXTENSION: ${ext.name} INSTALLED.`);
        callback(
          `      ${toInstallExtensions.indexOf(ext) + 1} OF ${
            toInstallExtensions.length
          } INSTALLED`,
          true
        );
        callback('');
        installedExtensions.push(ext);
      } catch (err) {
        throw new Error(err);
      }
    }
    return installedExtensions;
  }

  public static async DeleteExtensions(
    extensions: string,
    ignoredExtensions: string[],
    callback: (msg: string, show?: boolean) => void
  ): Promise<ExtensionInformation[]> {
    const toDeleteExtensions = PluginService.GetExtensionsToDelete(
      extensions,
      ignoredExtensions
    );
    if (toDeleteExtensions.length === 0) {
      return [];
    }

    callback('TOTAL EXTENSIONS TO UNINSTALL: ' + toDeleteExtensions.length);
    callback('');
    callback('');
    return Promise.all(
      toDeleteExtensions.map(async (selectedExtension) => {
        try {
          callback('');
          callback(`[x] - EXTENSION: ${selectedExtension.name} - UNINSTALLING`);
          await PluginService.DeleteExtensionAPI(selectedExtension);
          callback('');
          callback(`[x] - EXTENSION: ${selectedExtension.name} UNINSTALLED.`);
          callback('');
          return selectedExtension;
        } catch (err) {
          throw new Error(
            `Setting Backup: Unable to delete extension ${selectedExtension.name} ${selectedExtension.version}: ${err}`
          );
        }
      })
    );
  }

  private static GetExtensionsToDelete(
    extensions: string,
    ignoredExtensions: string[]
  ) {
    const extensionList = ExtensionInformation.fromJSONList(extensions);
    const localExtensions = this.GetExtensionList();
    return localExtensions.filter(
      (ext) =>
        ext.name !== 'setting-backup' &&
        !extensionList.map((e) => e.name).includes(ext.name) &&
        !ignoredExtensions.includes(ext.name)
    );
  }

  private static async DeleteExtensionAPI(
    extension: ExtensionInformation
  ): Promise<boolean> {
    try {
      await vscode.commands.executeCommand(
        'workbench.extensions.uninstallExtension',
        `${extension.publisher}.${extension.name}`
      );
      return true;
    } catch (err) {
      throw new Error(err);
    }
  }
}
