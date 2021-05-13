"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const minimatch = require("minimatch");
const path = require("path");
exports.activeConfigs = new Map();
function setConfig(configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const configBaseDir = path.dirname(configPath);
        const config = yield fs.readFile(configPath).then(b => JSON.parse(b.toString()));
        exports.activeConfigs.set(configBaseDir, transform(config));
    });
}
exports.setConfig = setConfig;
function transform(config) {
    const includes = [];
    const excludes = [];
    for (const pattern in config.include) {
        if (config.include.hasOwnProperty(pattern)) {
            const rules = config.include[pattern];
            includes.push({ pattern: minimatch.makeRe(pattern), rules });
        }
    }
    for (const pattern in config.exclude) {
        if (config.exclude.hasOwnProperty(pattern)) {
            const rules = config.exclude[pattern];
            excludes.push({ pattern: minimatch.makeRe(pattern), rules });
        }
    }
    return { include: includes, exclude: excludes };
}
exports.transform = transform;
function removeConfig(configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const configBaseDir = path.dirname(configPath);
        exports.activeConfigs.delete(configBaseDir);
    });
}
exports.removeConfig = removeConfig;
function getConfig(fsPath) {
    for (const configBaseDir of exports.activeConfigs.keys()) {
        const relative = path.relative(configBaseDir, fsPath);
        if (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
            return exports.activeConfigs.get(configBaseDir);
        }
    }
}
exports.getConfig = getConfig;
function matchConfig(fileName, ruleName, configObj) {
    let matches = false;
    const findMatch = (configSettings) => {
        for (const configSetting of configSettings) {
            if (!fileName.match(configSetting.pattern))
                continue;
            for (const rulePattern of configSetting.rules) {
                if (rulePattern === '*' || rulePattern === ruleName)
                    return true;
            }
        }
    };
    matches = findMatch(configObj.include) || false;
    if (!matches)
        return false;
    return !findMatch(configObj.exclude);
}
exports.matchConfig = matchConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BzbExpbnQvY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsK0JBQStCO0FBQy9CLHVDQUF1QztBQUN2Qyw2QkFBNkI7QUFHbEIsUUFBQSxhQUFhLEdBQW9DLElBQUksR0FBRyxFQUFFLENBQUM7QUFpQnRFLFNBQXNCLFNBQVMsQ0FBQyxVQUFrQjs7UUFDakQsTUFBTSxhQUFhLEdBQWtCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUQsTUFBTSxNQUFNLEdBQVcsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RixxQkFBYSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDckQsQ0FBQztDQUFBO0FBSkQsOEJBSUM7QUFFRCxTQUFnQixTQUFTLENBQUMsTUFBYztJQUN2QyxNQUFNLFFBQVEsR0FBcUIsRUFBRSxDQUFDO0lBQ3RDLE1BQU0sUUFBUSxHQUFxQixFQUFFLENBQUM7SUFDdEMsS0FBSyxNQUFNLE9BQU8sSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ3JDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0MsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUM3RDtLQUNEO0lBQ0QsS0FBSyxNQUFNLE9BQU8sSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO1FBQ3JDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0MsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUM3RDtLQUNEO0lBQ0QsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBQ2pELENBQUM7QUFoQkQsOEJBZ0JDO0FBRUQsU0FBc0IsWUFBWSxDQUFDLFVBQWtCOztRQUNwRCxNQUFNLGFBQWEsR0FBa0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RCxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNyQyxDQUFDO0NBQUE7QUFIRCxvQ0FHQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxNQUFjO0lBQ3ZDLEtBQUssTUFBTSxhQUFhLElBQUkscUJBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNqRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMzRSxPQUFPLHFCQUFhLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQ3hDO0tBQ0Q7QUFDRixDQUFDO0FBUEQsOEJBT0M7QUFFRCxTQUFnQixXQUFXLENBQUMsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLFNBQXNCO0lBQ3JGLElBQUksT0FBTyxHQUFZLEtBQUssQ0FBQztJQUM3QixNQUFNLFNBQVMsR0FBRyxDQUFDLGNBQWdDLEVBQUUsRUFBRTtRQUN0RCxLQUFLLE1BQU0sYUFBYSxJQUFJLGNBQWMsRUFBRTtZQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2dCQUFFLFNBQVM7WUFDckQsS0FBSyxNQUFNLFdBQVcsSUFBSSxhQUFhLENBQUMsS0FBSyxFQUFFO2dCQUM5QyxJQUFJLFdBQVcsS0FBSyxHQUFHLElBQUksV0FBVyxLQUFLLFFBQVE7b0JBQUUsT0FBTyxJQUFJLENBQUM7YUFDakU7U0FDRDtJQUNGLENBQUMsQ0FBQztJQUVGLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQztJQUNoRCxJQUFJLENBQUMsT0FBTztRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFkRCxrQ0FjQyJ9