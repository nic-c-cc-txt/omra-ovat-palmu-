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
const RedisHandler_1 = require("./RedisHandler");
const path = require("path");
const model_1 = require("./model");
const lodash_1 = require("lodash");
const enum_1 = require("./enum");
class RedisProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData
            .event;
        this.redisHandler = {};
        this.scanLimit = enum_1.Constants.RedisScanLimit;
    }
    refresh(profileName) {
        console.log('Refresh profile : ' + profileName);
        this._onDidChangeTreeData.fire();
    }
    getServerNodeInfo(connKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getRedisHandler(connKey).getInfo();
        });
    }
    getNodeValue(key, connKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getRedisHandler(connKey).getValue(key);
        });
    }
    disconnectRedis(connKey) {
        this.getRedisHandler(connKey).disconnect();
        lodash_1.unset(this.redisHandler, connKey);
    }
    getTreeItem(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.redisHandler || element.key === '') {
                return Promise.reject();
            }
            let treeItem = new vscode.TreeItem(element.key, element.type === enum_1.ItemType.Server
                ? vscode.TreeItemCollapsibleState.Collapsed
                : vscode.TreeItemCollapsibleState.None);
            let result = new model_1.Entry();
            result.key = element.key;
            if (element.type === enum_1.ItemType.Server) {
                result.value = '#server#';
                result.serverName = element.key;
            }
            else {
                result.value = element.key;
                result.serverName = element.serverName;
            }
            result.dataType = typeof result.value;
            result.iconType = element.iconType;
            let iconFile = element.type === enum_1.ItemType.Server ? "folder.svg" : "key.svg";
            treeItem.iconPath = {
                light: path.join(__filename, "..", "..", "resources", "light", iconFile),
                dark: path.join(__filename, "..", "..", "resources", "dark", iconFile)
            };
            treeItem.command = {
                command: enum_1.Command.ReadNodeData,
                title: "Read Data",
                arguments: [result]
            };
            if (element.type === enum_1.ItemType.Server) {
                treeItem.contextValue = "redisServerNode";
            }
            else {
                treeItem.contextValue = "redisNode";
            }
            return treeItem;
        });
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            let children = [];
            if (!element) {
                const configuration = vscode.workspace.getConfiguration();
                let xconfig = configuration.redisXplorer.config;
                if (xconfig.profiles && xconfig.profiles.length > 0) {
                    xconfig.profiles.forEach((curValue) => {
                        let node = new model_1.Entry();
                        node.key = curValue.name;
                        node.type = enum_1.ItemType.Server;
                        node.iconType = enum_1.ItemType.Server;
                        node.serverName = curValue.name;
                        node.value = 'redis://:' + curValue.accessKey + '@' + curValue.host;
                        node.dataType = typeof node.value;
                        node.filter = curValue.filter || '*';
                        children.push(node);
                    });
                }
                return children;
            }
            else if (element.type === enum_1.ItemType.Server) {
                try {
                    const result = yield this.getRedisHandler(element.serverName).getKeysV2(element.filter, this.scanLimit);
                    return result.map((value) => {
                        let node = new model_1.Entry();
                        node.key = value;
                        node.type = enum_1.ItemType.Item;
                        node.iconType = enum_1.ItemType.Item;
                        node.serverName = element.serverName;
                        node.value = '';
                        node.dataType = typeof node.value;
                        return node;
                    });
                }
                catch (e) {
                    return children;
                }
            }
            return children;
        });
    }
    setRedisValue(key, value, connKey) {
        this.getRedisHandler(connKey).setValue(key, value);
    }
    setRedisObject(key, value, connKey) {
        this.getRedisHandler(connKey).setObject(key, value);
    }
    setRedisScanLimit(limit) {
        this.scanLimit = limit;
    }
    deleteRedis(key, connKey) {
        this.getRedisHandler(connKey).delete(key);
    }
    flushAll(connKey) {
        this.getRedisHandler(connKey).flushAll();
    }
    getRedisHandler(connKey) {
        if (lodash_1.isNil(this.redisHandler[connKey])) {
            this.redisHandler[connKey] = new RedisHandler_1.default();
            const configuration = vscode.workspace.getConfiguration();
            let xconfig = configuration.redisXplorer.config;
            if (xconfig) {
                if (xconfig.scanLimit) {
                    this.scanLimit = xconfig.scanLimit;
                }
                if (xconfig.profiles.length > 0) {
                    let connectProfile = lodash_1.find(xconfig.profiles, (o) => {
                        return o.name === connKey;
                    });
                    if (connectProfile) {
                        console.log("Redis connect to : ", connectProfile.host);
                        let portNumber = connectProfile.port || enum_1.Constants.RedisDefaultPortNo;
                        let url = '';
                        if (portNumber === enum_1.Constants.RedisSslPortNo) {
                            url += "rediss://";
                            this.redisHandler[connKey].setTlsOn();
                        }
                        else {
                            url += "redis://";
                        }
                        if (connectProfile.accessKey !== '') {
                            url += ':' + connectProfile.accessKey + "@";
                        }
                        url += connectProfile.host + ":" + portNumber;
                        this.redisHandler[connKey].connect(url).then(() => { this.refresh(connKey); });
                    }
                }
            }
        }
        return this.redisHandler[connKey];
    }
}
exports.RedisProvider = RedisProvider;
//# sourceMappingURL=RedisProvider.js.map