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
const parser_1 = require("./parser");
const tokenizer_1 = require("./tokenizer");
exports.dummyPosition = new tokenizer_1.Position(0, 0);
class ParsedDocFinder {
    constructor(parsedDocument, paths, getWorkspaceDocumentText) {
        this.hierarchy = [];
        this.parsedDocument = parsedDocument;
        this.paths = paths;
        if (getWorkspaceDocumentText)
            this.getWorkspaceDocumentText = getWorkspaceDocumentText;
        this.procName = path.basename(this.paths.activeRoutine).split('.')[0];
    }
    resolveResult(callTokens) {
        return __awaiter(this, void 0, void 0, function* () {
            let finder = this;
            if (callTokens.length === 1) {
                const result = yield finder.searchParser(callTokens[0]);
                // check for core class or tables
                if (!result) {
                    const pslClsNames = yield getPslClsNames(this.paths.corePsl);
                    if (pslClsNames.indexOf(callTokens[0].value) >= 0) {
                        finder = yield finder.newFinder(callTokens[0].value);
                        return {
                            fsPath: finder.paths.activeRoutine,
                        };
                    }
                    const tableName = callTokens[0].value.replace('Record', '');
                    const fileDefinitionDirectory = yield this.resolveFileDefinitionDirectory(tableName);
                    if (fileDefinitionDirectory) {
                        return {
                            fsPath: path.join(fileDefinitionDirectory, tableName.toUpperCase() + '.TBL'),
                        };
                    }
                    else if (callTokens[0] === this.parsedDocument.extending) {
                        finder = yield finder.newFinder(callTokens[0].value);
                        return {
                            fsPath: finder.paths.activeRoutine,
                        };
                    }
                    else if (callTokens[0].value === 'this' || callTokens[0].value === this.procName) {
                        return {
                            fsPath: this.paths.activeRoutine,
                        };
                    }
                }
                // handle static types
                else if (result.member.types[0] === callTokens[0]) {
                    finder = yield finder.newFinder(result.member.id.value);
                    return {
                        fsPath: finder.paths.activeRoutine,
                    };
                }
                return result;
            }
            else {
                let result;
                for (let index = 0; index < callTokens.length; index++) {
                    const token = callTokens[index];
                    if (index === 0) {
                        // handle core class
                        const pslClsNames = yield getPslClsNames(this.paths.corePsl);
                        if (pslClsNames.indexOf(token.value) >= 0) {
                            finder = yield finder.newFinder(token.value);
                            continue;
                        }
                        // skip over 'this'
                        else if (token.value === 'this' || token.value === this.procName) {
                            result = {
                                fsPath: this.paths.activeRoutine,
                            };
                            continue;
                        }
                        else {
                            result = yield finder.searchParser(token);
                        }
                    }
                    if (!result || (result.fsPath === this.paths.activeRoutine && !result.member)) {
                        result = yield finder.searchInDocument(token.value);
                    }
                    if (!result)
                        return;
                    if (!callTokens[index + 1])
                        return result;
                    let type = result.member.types[0].value;
                    if (type === 'void')
                        type = 'Primitive'; // TODO whack hack
                    finder = yield finder.newFinder(type);
                    result = undefined;
                }
            }
        });
    }
    newFinder(routineName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (routineName.startsWith('Record') && routineName !== 'Record') {
                const tableName = routineName.replace('Record', '');
                const tableDirectory = yield this.resolveFileDefinitionDirectory(tableName.toLowerCase());
                if (!tableDirectory)
                    return;
                const columns = (yield fs.readdir(tableDirectory)).filter(file => file.endsWith('.COL')).map(col => {
                    const colName = col.replace(`${tableName}-`, '').replace('.COL', '').toLowerCase();
                    const ret = {
                        id: new tokenizer_1.Token(1 /* Alphanumeric */, colName, exports.dummyPosition),
                        memberClass: parser_1.MemberClass.column,
                        modifiers: [],
                        types: [new tokenizer_1.Token(1 /* Alphanumeric */, 'String', exports.dummyPosition)],
                    };
                    return ret;
                });
                const text = yield this.getWorkspaceDocumentText(path.join(tableDirectory, `${tableName.toUpperCase()}.TBL`));
                const parsed = jsonc.parse(text);
                const parentFileId = parsed.PARFID;
                const extendingValue = parentFileId ? `Record${parentFileId}` : 'Record';
                const parsedDocument = {
                    comments: [],
                    declarations: [],
                    extending: new tokenizer_1.Token(1 /* Alphanumeric */, extendingValue, exports.dummyPosition),
                    methods: [],
                    properties: columns,
                    pslPackage: '',
                    tokens: [],
                };
                const newPaths = Object.create(this.paths);
                newPaths.activeRoutine = '';
                newPaths.activeTable = tableDirectory;
                return new ParsedDocFinder(parsedDocument, newPaths, this.getWorkspaceDocumentText);
            }
            const pathsWithoutExtensions = this.paths.projectPsl.map(pslPath => path.join(pslPath, routineName));
            for (const pathWithoutExtension of pathsWithoutExtensions) {
                for (const extension of ['.PROC', '.psl', '.PSL']) {
                    const possiblePath = pathWithoutExtension + extension;
                    const routineText = yield this.getWorkspaceDocumentText(possiblePath);
                    if (!routineText)
                        continue;
                    const newPaths = Object.create(this.paths);
                    newPaths.activeRoutine = possiblePath;
                    return new ParsedDocFinder(parser_1.parseText(routineText), newPaths, this.getWorkspaceDocumentText);
                }
            }
        });
    }
    /**
     * Search the parsed document and parents for a particular member
     */
    searchParser(queriedToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const activeMethod = this.findActiveMethod(queriedToken);
            if (activeMethod) {
                const variable = this.searchInMethod(activeMethod, queriedToken);
                if (variable)
                    return { member: variable, fsPath: this.paths.activeRoutine };
            }
            return this.searchInDocument(queriedToken.value);
        });
    }
    searchInDocument(queriedId) {
        return __awaiter(this, void 0, void 0, function* () {
            let foundProperty;
            if (this.paths.activeTable) {
                foundProperty = this.parsedDocument.properties.find(p => p.id.value.toLowerCase() === queriedId.toLowerCase());
                if (foundProperty) {
                    const tableName = path.basename(this.paths.activeTable).toUpperCase();
                    return {
                        fsPath: path.join(this.paths.activeTable, `${tableName}-${foundProperty.id.value.toUpperCase()}.COL`),
                        member: foundProperty,
                    };
                }
            }
            foundProperty = this.parsedDocument.properties.find(p => p.id.value === queriedId);
            if (foundProperty)
                return { member: foundProperty, fsPath: this.paths.activeRoutine };
            const foundMethod = this.parsedDocument.methods.find(p => p.id.value === queriedId);
            if (foundMethod)
                return { member: foundMethod, fsPath: this.paths.activeRoutine };
            if (this.parsedDocument.extending) {
                const parentRoutineName = this.parsedDocument.extending.value;
                if (this.hierarchy.indexOf(parentRoutineName) > -1)
                    return;
                const parentFinder = yield this.searchForParent(parentRoutineName);
                if (!parentFinder)
                    return;
                return parentFinder.searchInDocument(queriedId);
            }
        });
    }
    findAllInDocument(results) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!results)
                results = [];
            const addToResults = (result) => {
                if (!results.find(r => r.member.id.value === result.member.id.value)) {
                    results.push(result);
                }
            };
            if (this.paths.activeTable) {
                this.parsedDocument.properties.forEach(property => {
                    const tableName = path.basename(this.paths.activeTable).toUpperCase();
                    addToResults({ member: property, fsPath: path.join(this.paths.activeTable, `${tableName}-${property.id.value.toUpperCase()}.COL`) });
                });
            }
            this.parsedDocument.properties.forEach(property => {
                addToResults({ member: property, fsPath: this.paths.activeRoutine });
            });
            this.parsedDocument.methods.forEach(method => {
                addToResults({ member: method, fsPath: this.paths.activeRoutine });
            });
            if (this.parsedDocument.extending) {
                const parentRoutineName = this.parsedDocument.extending.value;
                if (this.hierarchy.indexOf(parentRoutineName) > -1)
                    return results;
                const parentFinder = yield this.searchForParent(parentRoutineName);
                if (!parentFinder)
                    return results;
                return parentFinder.findAllInDocument(results);
            }
            return results;
        });
    }
    resolveFileDefinitionDirectory(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const tableSource of this.paths.tables) {
                const directory = path.join(tableSource, tableName.toLowerCase());
                if (yield fs.pathExists(directory)) {
                    return directory;
                }
            }
            return '';
        });
    }
    searchForParent(parentRoutineName) {
        return __awaiter(this, void 0, void 0, function* () {
            const parentFinder = yield this.newFinder(parentRoutineName);
            if (!parentFinder)
                return;
            parentFinder.hierarchy = this.hierarchy.concat(this.paths.activeRoutine);
            return parentFinder;
        });
    }
    searchInMethod(activeMethod, queriedToken) {
        for (const variable of activeMethod.declarations.reverse()) {
            if (queriedToken.position.line < variable.id.position.line)
                continue;
            if (queriedToken.value === variable.id.value)
                return variable;
        }
        for (const parameter of activeMethod.parameters) {
            if (queriedToken.value === parameter.id.value)
                return parameter;
        }
    }
    findActiveMethod(queriedToken) {
        const methods = this.parsedDocument.methods.filter(method => queriedToken.position.line >= method.id.position.line);
        if (methods)
            return methods[methods.length - 1];
    }
    getWorkspaceDocumentText(fsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return fs.readFile(fsPath).then(b => b.toString()).catch(() => '');
        });
    }
}
exports.ParsedDocFinder = ParsedDocFinder;
function getPslClsNames(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const names = yield fs.readdir(dir);
            return names.map(name => name.split('.')[0]);
        }
        catch (_a) {
            return [];
        }
    });
}
/**
 * Get the tokens on the line of position, as well as the specific index of the token at position
 */
function searchTokens(tokens, position) {
    const tokensOnLine = tokens.filter(t => t.position.line === position.line);
    if (tokensOnLine.length === 0)
        return undefined;
    const index = tokensOnLine.findIndex(t => {
        if (t.isNewLine() || t.isSpace() || t.isTab())
            return;
        const start = t.position;
        const end = { line: t.position.line, character: t.position.character + t.value.length };
        return isBetween(start, position, end);
    });
    return { tokensOnLine, index };
}
exports.searchTokens = searchTokens;
function isBetween(lb, t, ub) {
    return lb.line <= t.line &&
        lb.character <= t.character &&
        ub.line >= t.line &&
        ub.character >= t.character;
}
function getCallTokens(tokensOnLine, index) {
    const ret = [];
    let current = getChildNode(tokensOnLine, index);
    if (!current)
        return ret;
    while (current.parent && current.token) {
        ret.unshift(current.token);
        current = current.parent;
    }
    if (current.token)
        ret.unshift(current.token);
    return ret;
}
exports.getCallTokens = getCallTokens;
function getChildNode(tokensOnLine, index) {
    const currentToken = tokensOnLine[index];
    if (!currentToken)
        return { token: undefined };
    const previousToken = tokensOnLine[index - 1];
    const nextToken = tokensOnLine[index + 1];
    let routine = false;
    if (previousToken) {
        let newIndex = -1;
        if (currentToken.isPeriod()) {
            newIndex = resolve(tokensOnLine.slice(0, index));
        }
        else if (previousToken.isCaret()) {
            routine = true;
        }
        else if (currentToken.isAlphanumeric() && previousToken.isPeriod()) {
            newIndex = resolve(tokensOnLine.slice(0, index - 1));
        }
        if (newIndex >= 0) {
            const parent = getChildNode(tokensOnLine, newIndex);
            return { parent, token: currentToken };
        }
    }
    if (nextToken && nextToken.isCaret()) {
        const routineToken = tokensOnLine[index + 2];
        if (!routineToken)
            return undefined;
        return { parent: { token: routineToken, routine: true }, token: currentToken };
    }
    if (currentToken.isAlphanumeric()) {
        return { token: currentToken, routine };
    }
    return undefined;
}
function resolve(tokens) {
    const length = tokens.length;
    let parenCount = 0;
    if (length === 0)
        return -1;
    if (tokens[length - 1].isAlphanumeric())
        return length - 1;
    for (let index = tokens.length - 1; index >= 0; index--) {
        const token = tokens[index];
        if (token.isCloseParen())
            parenCount++;
        else if (token.isOpenParen())
            parenCount--;
        if (parenCount === 0) {
            if (index > 0 && tokens[index - 1].isAlphanumeric())
                return index - 1;
            else
                return -1;
        }
    }
    return -1;
}
exports.resolve = resolve;
function findCallable(tokensOnLine, index) {
    const callables = [];
    for (let tokenBufferIndex = 0; tokenBufferIndex <= index; tokenBufferIndex++) {
        const token = tokensOnLine[tokenBufferIndex];
        if (!tokenBufferIndex && !token.isTab() && !token.isSpace())
            return;
        if (token.isOpenParen()) {
            callables.push({ tokenBufferIndex: tokenBufferIndex - 1, parameterIndex: 0 });
        }
        else if (token.isCloseParen()) {
            if (callables.length)
                callables.pop();
            else
                return;
        }
        else if (token.isComma() && callables.length) {
            callables[callables.length - 1].parameterIndex += 1;
        }
    }
    if (!callables.length)
        return;
    const activeCallable = callables[callables.length - 1];
    return {
        callTokens: getCallTokens(tokensOnLine, activeCallable.tokenBufferIndex),
        parameterIndex: activeCallable.parameterIndex,
    };
}
exports.findCallable = findCallable;
function getLineAfter(method) {
    return method.closeParen ? method.closeParen.position.line + 1 : method.id.position.line + 1;
}
exports.getLineAfter = getLineAfter;
function getCommentsOnLine(parsedDocument, lineNumber) {
    return parsedDocument.comments.filter(t => {
        return t.position.line === lineNumber;
    });
}
exports.getCommentsOnLine = getCommentsOnLine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbGl0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhcnNlci91dGlsaXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSwrQkFBK0I7QUFDL0Isc0NBQXNDO0FBQ3RDLDZCQUE2QjtBQUU3QixxQ0FBNEY7QUFDNUYsMkNBQW9EO0FBT3ZDLFFBQUEsYUFBYSxHQUFHLElBQUksb0JBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFFaEQsTUFBYSxlQUFlO0lBUTNCLFlBQ0MsY0FBOEIsRUFDOUIsS0FBa0IsRUFDbEIsd0JBQThEO1FBTHZELGNBQVMsR0FBYSxFQUFFLENBQUM7UUFPaEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSx3QkFBd0I7WUFBRSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsd0JBQXdCLENBQUM7UUFDdkYsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFSyxhQUFhLENBQUMsVUFBbUI7O1lBQ3RDLElBQUksTUFBTSxHQUFvQixJQUFJLENBQUM7WUFFbkMsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDNUIsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV4RCxpQ0FBaUM7Z0JBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ1osTUFBTSxXQUFXLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDN0QsSUFBSSxX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