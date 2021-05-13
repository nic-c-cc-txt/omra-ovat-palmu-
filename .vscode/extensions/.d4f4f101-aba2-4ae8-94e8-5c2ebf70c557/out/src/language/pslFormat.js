"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const parser = require("../parser/parser");
const extension_1 = require("../extension");
function activate(context) {
    context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(extension_1.PSL_MODE, new PSLFormatProvider()));
}
exports.activate = activate;
class PSLFormatProvider {
    provideDocumentFormattingEdits(document) {
        let textEdits = [];
        return new Promise(resolve => {
            let p = parser.parseText(document.getText());
            p.methods.forEach(method => {
                if (!method.closeParen)
                    return;
                method.memberClass;
                let methodLine = method.id.position.line;
                let closePosition = method.closeParen.position;
                let methodRange = new vscode.Range(methodLine, 0, closePosition.line, closePosition.character + 1);
                textEdits.push(new vscode.TextEdit(methodRange, buildText(method)));
            });
            resolve(textEdits);
        });
    }
}
exports.PSLFormatProvider = PSLFormatProvider;
function buildText(method) {
    let methodString = '';
    if (method.modifiers.length > 0) {
        methodString += method.modifiers.map(m => m.value).join(' ') + ' ';
    }
    methodString += `${method.id.value}(`;
    let parameterStrings = method.parameters.map(p => {
        let param = { parameter: '', comment: '' };
        let parameterString = '';
        if (p.req) {
            parameterString += 'req ';
        }
        if (p.ret) {
            parameterString += 'ret ';
        }
        if (p.literal) {
            parameterString += 'literal ';
        }
        parameterString += p.types[0].value + ' ' + p.id.value;
        if (p.types.length > 1) {
            parameterString += `( ${p.types.map(t => t.value).slice(1).join(', ')})`;
        }
        if (p.comment) {
            param.comment = `\t// ${p.comment.value.trim()}`;
        }
        param.parameter = parameterString;
        return param;
    });
    if (parameterStrings.length === 0) {
        methodString += ')';
    }
    else if (parameterStrings.length === 1) {
        methodString += parameterStrings[0].parameter + ')' + parameterStrings[0].comment;
    }
    else {
        methodString += '\n\t\t  ' + parameterStrings.map(p => p.parameter + p.comment).join('\n\t\t, ');
        methodString += '\n\t\t)';
    }
    return methodString;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNsRm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbmd1YWdlL3BzbEZvcm1hdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFpQztBQUNqQywyQ0FBMkM7QUFDM0MsNENBQXdDO0FBRXhDLFNBQWdCLFFBQVEsQ0FBQyxPQUFnQztJQUV4RCxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FDekIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxzQ0FBc0MsQ0FDdEQsb0JBQVEsRUFBRSxJQUFJLGlCQUFpQixFQUFFLENBQ2pDLENBQ0QsQ0FBQztBQUVILENBQUM7QUFSRCw0QkFRQztBQUVELE1BQWEsaUJBQWlCO0lBQzdCLDhCQUE4QixDQUFDLFFBQTZCO1FBQzNELElBQUksU0FBUyxHQUFzQixFQUFFLENBQUM7UUFDdEMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM1QixJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7b0JBQUUsT0FBTztnQkFDL0IsTUFBTSxDQUFDLFdBQVcsQ0FBQTtnQkFDbEIsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUN6QyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztnQkFDL0MsSUFBSSxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsYUFBYSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFBO2dCQUNsRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUks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