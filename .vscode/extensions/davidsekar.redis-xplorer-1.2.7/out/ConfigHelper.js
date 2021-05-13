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
const vscode = require("vscode");
const model_1 = require("./model");
const lodash_1 = require("lodash");
const enum_1 = require("./enum");
/**
 * Helper class to manage the vscode workspace configuration
 */
class ConfigHelper {
    constructor() { }
    /**
     * Add or Update the XplorerProfile based on the profile name
     * @param profileName profile name to add or update
     * @param hostName hostname of the server to connect
     * @param password password to authenticate connection
     */
    addOrUpdateConfig(profileName, hostName, port, password, oldProfileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let xconfig = yield this.getXConfig();
                let isUpdated = false;
                lodash_1.each(xconfig.profiles, (p) => {
                    if (p.name === oldProfileName) {
                        p.name = profileName;
                        p.host = hostName;
                        p.accessKey = password;
                        p.port = port;
                        isUpdated = true;
                    }
                });
                if (!isUpdated) {
                    let profile = new model_1.XplorerProfiles(profileName, hostName, port, password);
                    xconfig.profiles.push(profile);
                }
                yield this.saveXplorerConfig(xconfig);
                resolve();
            }));
        });
    }
    /**
     * Deletes the profile object based on the provided servername
     * @param serverName servername of the connection profile to delete
     */
    deleteXplorerConfig(serverName) {
        return __awaiter(this, void 0, void 0, function* () {
            let xconfig = yield this.getXConfig();
            let removedProfiles = lodash_1.remove(xconfig.profiles, (p) => { return p.name === serverName; });
            let deleted = false;
            if (removedProfiles.length > 0) {
                yield this.saveXplorerConfig(xconfig).then(() => {
                    console.log('Selected profile was removed successfully!');
                });
                deleted = true;
            }
            else {
                console.log('Nothing to delete!');
            }
            return deleted;
        });
    }
    /**
     * Update the selected connection with the given filter text
     * @param serverName servername of the connection
     * @param filterText text pattern to use for filtering
     */
    updatefilterText(serverName, filterText) {
        return __awaiter(this, void 0, void 0, function* () {
            let xconfig = yield this.getXConfig();
            lodash_1.each(xconfig.profiles, (p) => {
                if (p.name === serverName) {
                    p.filter = filterText;
                }
            });
            yield this.saveXplorerConfig(xconfig).then(() => { console.log('filtered successfully!'); });
        });
    }
    /**
     * Get the connection profile based on name
     * @param name name of the profile
     */
    getProfileByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            let xconfig = yield this.getXConfig();
            let profile = lodash_1.find(xconfig.profiles, (p) => {
                return p.name === name;
            });
            return profile;
        });
    }
    /**
     * Save a new count of items to fetch from Redis server incrementally
     * @param limit Number of items to request in a scan (each request)
     */
    saveRedisScanLimit(limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let xconfig = yield this.getXConfig();
            // Direct child object in Xplorer Config is readonly,
            // So do a deepcopy and then modify the value. 
            let clonedXConfig = lodash_1.cloneDeep(xconfig);
            clonedXConfig.scanLimit = limit;
            yield this.saveXplorerConfig(clonedXConfig);
        });
    }
    getRedisScanLimit() {
        return __awaiter(this, void 0, void 0, function* () {
            let xconfig = yield this.getXConfig();
            return xconfig.scanLimit || enum_1.Constants.RedisScanLimit;
        });
    }
    /**
     * Save configuration to Vscode settings file
     * @param config configuration to persist
     */
    saveXplorerConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.workspace.getConfiguration().update("redisXplorer.config", config, vscode.ConfigurationTarget.Workspace).then(() => {
                console.log('Configuration saved successfully!');
            }, (reason) => {
                console.log(reason);
            });
        });
    }
    /**
     * Get the Xplorer configuration saved in the Vscode workspace settings
     */
    getXConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const configuration = vscode.workspace.getConfiguration();
            let xconfig = configuration.redisXplorer.config;
            if (lodash_1.isNil(xconfig) || lodash_1.isEmpty(xconfig.profiles)) {
                xconfig = new model_1.XplorerConfig();
                xconfig.profiles = [];
            }
            return xconfig;
        });
    }
}
exports.ConfigHelper = ConfigHelper;
//# sourceMappingURL=ConfigHelper.js.map