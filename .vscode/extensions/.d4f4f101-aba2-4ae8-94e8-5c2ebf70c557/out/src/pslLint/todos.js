"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenizer_1 = require("../parser/tokenizer");
const api_1 = require("./api");
class TodoInfo extends api_1.PslRule {
    report() {
        let todos = [];
        for (const token of this.parsedDocument.comments) {
            if (token.value.includes('TODO')) {
                const startLine = token.position.line;
                const startChar = token.position.character;
                todos = todos.concat(getTodosFromComment(token.value, startLine, startChar));
            }
        }
        return todos.map(todo => {
            const diagnostic = new api_1.Diagnostic(todo.range, todo.message, this.ruleName, api_1.DiagnosticSeverity.Information);
            diagnostic.source = 'TODO';
            return diagnostic;
        });
    }
}
exports.TodoInfo = TodoInfo;
function getTodosFromComment(commentText, startLine, startChar) {
    let todos = [];
    let todo;
    let currentLine;
    let currentChar;
    const finalize = () => {
        if (!todo)
            return;
        const start = todo.range.start;
        const end = new tokenizer_1.Position(currentLine, todo.range.end.character + todo.message.trimRight().length);
        todo.range = new tokenizer_1.Range(start, end);
        todo.message = todo.message.trim().replace(/^:/gm, '').trim();
        if (!todo.message)
            todo.message = `TODO on line ${todo.range.start.line + 1}.`;
        todos.push(todo);
        todo = undefined;
    };
    const tokens = tokenizer_1.getTokens(commentText);
    for (const token of tokens) {
        currentLine = startLine + token.position.line;
        currentChar = startLine === currentLine ? token.position.character + startChar : token.position.character;
        if (token.isBlockCommentInit() || token.isLineCommentInit())
            continue;
        else if (token.isBlockComment() || token.isLineComment()) {
            todos = todos.concat(getTodosFromComment(token.value, currentLine, currentChar));
        }
        else if (token.value === 'TODO' && !todo) {
            const range = new tokenizer_1.Range(currentLine, currentChar, currentLine, currentChar + 4);
            const message = '';
            todo = { range, message };
        }
        else if (todo) {
            if (token.isNewLine())
                finalize();
            else
                todo.message += token.value;
        }
    }
    if (todo)
        finalize();
    return todos;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHNsTGludC90b2Rvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUFpRTtBQUNqRSwrQkFBZ0U7QUFFaEUsTUFBYSxRQUFTLFNBQVEsYUFBTztJQUVwQyxNQUFNO1FBQ0wsSUFBSSxLQUFLLEdBQVcsRUFBRSxDQUFDO1FBQ3ZCLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUU7WUFDakQsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDakMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO2dCQUMzQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO2FBQzdFO1NBQ0Q7UUFDRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkIsTUFBTSxVQUFVLEdBQUcsSUFBSSxnQkFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLHdCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBQzNCLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEO0FBakJELDRCQWlCQztBQU9ELFNBQVMsbUJBQW1CLENBQUMsV0FBbUIsRUFBRSxTQUFpQixFQUFFLFNBQWlCO0lBQ3JGLElBQUksS0FBSyxHQUFXLEVBQUUsQ0FBQztJQUN2QixJQUFJ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