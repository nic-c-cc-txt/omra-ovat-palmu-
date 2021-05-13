"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
/**
 * Handles editing a workspace settings file
 *
 * @export
 * @class SettingsAccessor
 */
class SettingsAccessor {
    hide(patterns) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = vscode_1.workspace.getConfiguration();
            const hidden = this.getWorkspaceValue(settings);
            const newSettings = Object.assign(hidden || {}, this._buildSettingsObject(patterns));
            settings.update('files.exclude', newSettings);
        });
    }
    show(patterns) {
        return __awaiter(this, void 0, void 0, function* () {
            const settings = vscode_1.workspace.getConfiguration();
            const hidden = this.getWorkspaceValue(settings);
            if (!hidden) {
                return;
            }
            // keep excluded files that arent excluded via gitignore
            const show = this._buildSettingsObject(patterns);
            const newSettings = {};
            for (const key in hidden) {
                if (key in show) {
                    continue;
                }
                newSettings[key] = hidden[key];
            }
            settings.update('files.exclude', newSettings);
        });
    }
    getWorkspaceValue(settings) {
        return settings.inspect('files.exclude').workspaceValue;
    }
    _buildSettingsObject(patterns) {
        const object = {};
        patterns.forEach((pattern) => (object[pattern.glob] = pattern.hide));
        return object;
    }
}
exports.SettingsAccessor = SettingsAccessor;
//# sourceMappingURL=settings-accessor.js.map