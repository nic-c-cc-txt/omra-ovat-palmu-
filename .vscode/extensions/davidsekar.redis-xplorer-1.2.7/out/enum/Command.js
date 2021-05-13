"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Command;
(function (Command) {
    // Common
    Command["ReadNodeData"] = "redisXplorer.readData";
    Command["ConfigureScanLimit"] = "config.commands.redisServer.scanLimit";
    // Server Node
    Command["AddRedisConnection"] = "config.commands.redisServer";
    Command["EditRedisConnection"] = "config.commands.redisServer.edit";
    Command["DeleteRedisConnection"] = "config.commands.redisServer.delServerItem";
    Command["RefreshServer"] = "config.commands.redisServer.refreshServerItem";
    Command["FilterServerByPattern"] = "config.commands.redisServer.filterServerItem";
    // Individual Node/Redis KVPair
    Command["DeleteAllKeys"] = "config.commands.redisServer.delAllItems";
    Command["AddRedisKey"] = "config.commands.redisServer.addItem";
    Command["DeleteRedisKey"] = "config.commands.redisServer.delItem";
    // Button Commands
    Command["CommandOk"] = "OK";
    Command["CommandDeleteAll"] = "Delete All";
})(Command = exports.Command || (exports.Command = {}));
//# sourceMappingURL=Command.js.map