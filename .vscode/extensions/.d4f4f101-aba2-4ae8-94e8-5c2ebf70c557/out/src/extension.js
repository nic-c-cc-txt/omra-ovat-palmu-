"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const terminal = require("./common/terminal");
const hostEnvironment = require("./common/environment");
const hostCommands = require("./hostCommands/activate");
const languageFeatures = require("./language/activate");
exports.PSL_MODE = { language: 'psl', scheme: 'file' };
exports.BATCH_MODE = { language: 'profileBatch', scheme: 'file' };
exports.TRIG_MODE = { language: 'profileTrigger', scheme: 'file' };
exports.DATA_MODE = { language: 'profileData', scheme: 'file' };
exports.TBL_MODE = { language: 'profileTable', scheme: 'file' };
exports.COL_MODE = { language: 'profileColumn', scheme: 'file' };
function activate(context) {
    hostCommands.activate(context);
    hostEnvironment.activate(context);
    terminal.activate(context);
    languageFeatures.activate(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2V4dGVuc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDhDQUE4QztBQUM5Qyx3REFBd0Q7QUFDeEQsd0RBQXdEO0FBQ3hELHdEQUF3RDtBQUUzQyxRQUFBLFFBQVEsR0FBMEIsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUN0RSxRQUFBLFVBQVUsR0FBMEIsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNqRixRQUFBLFNBQVMsR0FBMEIsRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQ2xGLFFBQUEsU0FBUyxHQUEwQixFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQy9FLFFBQUEsUUFBUSxHQUEwQixFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQy9FLFFBQUEsUUFBUSxHQUEwQixFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO0FBRzdGLFNBQWdCLFFBQVEsQ0FBQyxPQUFnQztJQUV4RCxZQUFZLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRS9CLGVBQWUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFbEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUUzQixnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQVRELDRCQVNDO0FBR0QsMkRBQTJEO0FBQzNELFNBQWdCLFVBQVU7QUFDMUIsQ0FBQztBQURELGdDQUNDIn0=