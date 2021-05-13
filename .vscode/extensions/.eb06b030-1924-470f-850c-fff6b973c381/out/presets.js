"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCommentBarPresets(config) {
    if (config.has("quickPresets")) {
        let cfg = config.get("quickPresets");
        if (cfg) {
            return cfg;
        }
    }
    return [];
}
exports.getCommentBarPresets = getCommentBarPresets;
//# sourceMappingURL=presets.js.map