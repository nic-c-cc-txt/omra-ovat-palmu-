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
const path = require("path");
const activeConfigs = new Map();
function setConfig(configPath, workspaces) {
    return __awaiter(this, void 0, void 0, function* () {
        const configBaseDir = path.dirname(configPath);
        const config = yield fs.readFile(configPath).then(b => JSON.parse(b.toString()));
        config.parentProjects = config.parentProjects.map(p => workspaces.get(p)).filter(x => x);
        activeConfigs.set(configBaseDir, config);
    });
}
exports.setConfig = setConfig;
function removeConfig(configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const configBaseDir = path.dirname(configPath);
        activeConfigs.delete(configBaseDir);
    });
}
exports.removeConfig = removeConfig;
function getFinderPaths(currentDir, activeRoutine) {
    const defaultPslSources = ['dataqwik/procedure/', 'psl/'];
    const defaultFileDefinitionSources = ['dataqwik/table/'];
    const config = activeConfigs.get(currentDir);
    const projectPsl = [];
    const tables = [];
    const loadPsl = (base, source) => projectPsl.push(path.join(base, source));
    const loadFileDefinition = (base, source) => tables.push(path.join(base, source));
    const relativePslSources = config && config.pslSources ? config.pslSources : defaultPslSources;
    const relativeFileDefinitionSource = config && config.fileDefinitionSources ?
        config.fileDefinitionSources : defaultFileDefinitionSources;
    const corePsl = path.join(currentDir, '.vscode/pslcls/');
    // load core first
    projectPsl.push(corePsl);
    // load base sources
    relativePslSources.forEach(source => loadPsl(currentDir, source));
    relativeFileDefinitionSource.forEach(source => loadFileDefinition(currentDir, source));
    // load parent sources
    if (config && config.parentProjects) {
        for (const parent of config.parentProjects) {
            relativePslSources.forEach(source => loadPsl(parent, source));
            relativeFileDefinitionSource.forEach(source => loadFileDefinition(parent, source));
        }
    }
    return {
        activeRoutine,
        corePsl,
        projectPsl,
        tables,
    };
}
exports.getFinderPaths = getFinderPaths;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhcnNlci9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0IsNkJBQTZCO0FBSTdCLE1BQU0sYUFBYSxHQUFzQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBUW5FLFNBQXNCLFNBQVMsQ0FBQyxVQUFrQixFQUFFLFVBQStCOztRQUNsRixNQUFNLGFBQWEsR0FBa0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RCxNQUFNLE1BQU0sR0FBa0IsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoRyxNQUFNLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLGFBQWEsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FBQTtBQUxELDhCQUtDO0FBRUQsU0FBc0IsWUFBWSxDQUFDLFVBQWtCOztRQUNwRCxNQUFNLGFBQWEsR0FBa0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM5RCxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7Q0FBQTtBQUhELG9DQUdDO0FBZ0NELFNBQWdCLGNBQWMsQ0FBQyxVQUFrQixFQUFFLGFBQXNCO0lBRXhFLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxRCxNQUFNLDRCQUE0QixHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUV6RCxNQUFNLE1BQU0sR0FBOEIsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUV4RSxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdEIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBRWxCLE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzNFLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFbEYsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUM7SUFDL0YsTUFBTSw0QkFBNEIsR0FBRyxNQUFNLElBQUksTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDNUUsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQztJQUU3RCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3pELGtCQUFrQjtJQUNsQixVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRXpCLG9CQUFvQjtJQUNwQixrQkFBa0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDbEUsNEJBQTRCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFdkYsc0JBQXNCO0lBQ3RCLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxjQUFjLEVBQUU7UUFDcEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFO1lBQzNDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM5RCw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUNuRjtLQUVEO0lBRUQsT0FBTztRQUNOLGFBQWE7UUFDYixPQUFPO1FBQ1AsVUFBVTtRQUNWLE1BQU07S0FDTixDQUFDO0FBQ0gsQ0FBQztBQXhDRCx3Q0F3Q0MifQ==