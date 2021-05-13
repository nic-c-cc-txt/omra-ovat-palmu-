'use strict';
import { normalize, resolve } from 'path';
import { ExtensionContext } from 'vscode';

export class Environment {
  public context: ExtensionContext;
  public PATH: string = '';
  public FILE_SETTING: string = '';
  public USER_FOLDER: string = '';
  public FILE_EXTENSION: string = '';
  public FILE_SETTING_NAME: string = 'settings.json';
  public FILE_KEYBINDING_NAME: string = 'keybindings.json';
  public FILE_KEYBINDING_MAC: string = 'keybindingsMac.json';
  public FILE_KEYBINDING_DEFAULT: string = 'keybindings.json';
  public FILE_EXTENSION_NAME: string = 'extensions.json';
  public FILE_KEYBINDING: string = '';

  constructor(context: ExtensionContext) {
    this.context = context;
    this.PATH = resolve(this.context.globalStoragePath, '../../..').concat(
      normalize('/')
    );
    this.USER_FOLDER = resolve(this.PATH, 'User').concat(normalize('/'));
    this.FILE_SETTING = this.USER_FOLDER.concat(this.FILE_SETTING_NAME);
    this.FILE_EXTENSION = this.USER_FOLDER.concat(this.FILE_EXTENSION_NAME);
    this.FILE_KEYBINDING = this.USER_FOLDER.concat(
      this.FILE_KEYBINDING_DEFAULT
    );
  }
}
