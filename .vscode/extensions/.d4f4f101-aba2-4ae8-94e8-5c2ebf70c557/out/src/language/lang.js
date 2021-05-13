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
const jsonc = require("jsonc-parser");
const path = require("path");
const vscode = require("vscode");
const parser = require("../parser/parser");
function getDocumentation(result, finder) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fsPath, member } = result;
        if (!member) {
            // handle tables here
            if (fsPath.endsWith('.TBL')) {
                const text = yield getWorkspaceDocumentText(fsPath);
                const parsed = jsonc.parse(text);
                const doc = text.split('}')[1];
                const tableName = path.basename(fsPath).split('.')[0];
                return { code: '(table) ' + tableName, markdown: `${parsed.DES}\n\n${doc}` };
            }
        }
        else if (member.memberClass === parser.MemberClass.column) {
            const typs = {
                $: ['Number', 'column type: $ (Currency)'],
                B: ['String', 'column type: B (Blob)'],
                C: ['Number', 'column type: C (Time)'],
                D: ['Date', 'column type: D (Date)'],
                F: ['Number', 'column type: F (Frequency)'],
                L: ['Boolean', 'column type: L (Logical)'],
                M: ['String', 'column type: M (Memo)'],
                N: ['Number', 'column type: N (Number)'],
                T: ['String', 'column type: T (Text)'],
                U: ['String', 'column type: U (Uppercase text)'],
            };
            const text = yield getWorkspaceDocumentText(fsPath);
            const parsed = jsonc.parse(text);
            const typ = parsed.TYP;
            const doc = text.split('}')[1];
            return {
                code: `(column) ${typs[typ][0]} ${member.id.value}`,
                markdown: `${parsed.DES}\n\n${typs[typ][1]}\n\n${doc}`,
            };
        }
        else if (member.memberClass === parser.MemberClass.method) {
            const method = member;
            const sigArray = [...method.modifiers, method.types[0], method.id];
            const sig = sigArray.filter(Boolean).map(t => t.value).join(' ');
            const argString = method.parameters
                .map(param => `${param.types[0].value} ${param.id.value}`)
                .join('\n\u200B , ');
            let code = '';
            if (method.parameters.length === 0)
                code = `${sig}(${argString})`;
            else
                code = `${sig}(\n\u200B \u200B \u200B ${argString}\n\u200B )`;
            const markdown = method.documentation ? method.documentation : '';
            return { code, markdown };
        }
        else {
            let code = '';
            if (member.types.length === 0)
                code = `void ${member.id.value}`;
            else if (member.types.length === 1) {
                if (member.types[0] === member.id)
                    code = `static ${member.id.value}`;
                else
                    code = `${member.types[0].value} ${member.id.value}`;
            }
            else {
                code = `${member.types[0].value} ${member.id.value}( ${member.types.slice(1).map((t) => t.value).join(', ')})`;
            }
            switch (member.memberClass) {
                case parser.MemberClass.declaration:
                    code = ' type ' + code;
                    break;
                case parser.MemberClass.parameter:
                    code = '(parameter) ' + code;
                    break;
                case parser.MemberClass.property:
                    code = ' #PROPERTYDEF ' + code;
                    break;
                default:
                    return;
            }
            let markdown = result.member.documentation ? result.member.documentation : '';
            if (member.types[0].value.startsWith('Record')) {
                const tableName = member.types[0].value.replace('Record', '');
                const tableDirectory = yield finder.resolveFileDefinitionDirectory(tableName);
                if (tableDirectory) {
                    const tableLocation = path.join(tableDirectory, tableName.toUpperCase() + '.TBL');
                    const text = yield getWorkspaceDocumentText(tableLocation);
                    const parsed = jsonc.parse(text);
                    const doc = text.split('}')[1];
                    markdown = `${parsed.DES}\n\n${doc}`;
                }
            }
            return { code, markdown };
        }
    });
}
exports.getDocumentation = getDocumentation;
function getWorkspaceDocumentText(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        return fs.stat(fsPath).then(_ => {
            return vscode.workspace.openTextDocument(fsPath).then(textDocument => textDocument.getText(), () => '');
        }).catch(() => '');
    });
}
exports.getWorkspaceDocumentText = getWorkspaceDocumentText;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW5ndWFnZS9sYW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsK0JBQStCO0FBQy9CLHNDQUFzQztBQUN0Qyw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDLDJDQUEyQztBQVMzQyxTQUFzQixnQkFBZ0IsQ0FBQyxNQUEwQixFQUFFLE1BQTZCOztRQUMvRixNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUNsQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1oscUJBQXFCO1lBQ3JCLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDNUIsTUFBTSxJQUFJLEdBQUcsTUFBTSx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRELE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxHQUFHLFNBQVMsRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxPQUFPLEdBQUcsRUFBRSxFQUFFLENBQUM7YUFDN0U7U0FDRDthQUNJLElBQUksTUFBTSxDQUFDLFdBQVcsS0FBSyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRTtZQUMxRCxNQUFNLElBQUksR0FBRztnQkFDWixDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsMkJBQTJCLENBQUM7Z0JBQzFDLENBQUMsRUFBRSxD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