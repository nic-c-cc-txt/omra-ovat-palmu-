"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const statementParser_1 = require("./statementParser");
const tokenizer_1 = require("./tokenizer");
const utilities_1 = require("./utilities");
/**
 * Used for checking the type of Member at runtime
 */
var MemberClass;
(function (MemberClass) {
    MemberClass[MemberClass["method"] = 1] = "method";
    MemberClass[MemberClass["parameter"] = 2] = "parameter";
    MemberClass[MemberClass["property"] = 3] = "property";
    MemberClass[MemberClass["declaration"] = 4] = "declaration";
    MemberClass[MemberClass["column"] = 5] = "column";
    MemberClass[MemberClass["table"] = 6] = "table";
    MemberClass[MemberClass["proc"] = 7] = "proc";
})(MemberClass = exports.MemberClass || (exports.MemberClass = {}));
// tslint:disable-next-line:class-name
class _Method {
    constructor() {
        this.types = [];
        this.modifiers = [];
        this.parameters = [];
        this.line = -1;
        this.declarations = [];
        this.endLine = -1;
        this.memberClass = MemberClass.method;
        this.documentation = '';
        this.statements = [];
    }
}
// tslint:disable-next-line:class-name
class _Parameter {
    constructor() {
        this.modifiers = [];
        this.req = false;
        this.ret = false;
        this.literal = false;
        this.memberClass = MemberClass.parameter;
    }
}
const NON_METHOD_KEYWORDS = [
    'do', 'd', 'set', 's', 'if', 'i', 'for', 'f', 'while', 'w',
];
exports.NON_TYPE_MODIFIERS = [
    'public', 'static', 'private',
];
function parseText(sourceText) {
    const parser = new Parser();
    return parser.parseDocument(sourceText);
}
exports.parseText = parseText;
function parseFile(sourcePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(sourcePath, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                const parser = new Parser();
                resolve(parser.parseDocument(data.toString()));
            }
        });
    });
}
exports.parseFile = parseFile;
class Parser {
    constructor(tokenizer) {
        this.methods = [];
        this.properties = [];
        this.declarations = [];
        this.tokens = [];
        this.comments = [];
        if (tokenizer)
            this.tokenizer = tokenizer;
    }
    parseDocument(documentText) {
        this.tokenizer = tokenizer_1.getTokens(documentText);
        while (this.next()) {
            if (this.activeToken.isAlphanumeric() || this.activeToken.isMinusSign()) {
                const method = this.parseMethod();
                if (!method)
                    continue;
                this.methods.push(method);
                this.activeMethod = method;
            }
            else if (this.activeToken.isTab() || this.activeToken.isSpace()) {
                const lineNumber = this.activeToken.position.line;
                const tokenBuffer = this.loadTokenBuffer();
                const propertyDef = this.lookForPropertyDef(tokenBuffer);
                if (propertyDef) {
                    if (propertyDef.id)
                        this.properties.push(propertyDef);
                    this.activeProperty = propertyDef;
                    continue;
                }
                const typeDec = this.lookForTypeDeclaration(tokenBuffer);
                if (typeDec.length > 0) {
                    const activeDeclarations = this.activeMethod ? this.activeMethod.declarations : this.declarations;
                    for (const dec of typeDec)
                        activeDeclarations.push(dec);
                    continue;
                }
                const extending = this.checkForExtends(tokenBuffer);
                if (extending)
                    this.extending = extending;
                const pslPackage = this.checkForPSLPackage(tokenBuffer);
                if (pslPackage)
                    this.pslPackage = pslPackage;
                if (this.activeMethod && this.activeMethod.batch && this.activeMethod.id.value === 'REVHIST') {
                    continue;
                }
                const statements = this.parseStatementsOnLine(tokenBuffer);
                if (statements && this.activeMethod)
                    this.activeMethod.statements = this.activeMethod.statements.concat(statements);
                if (this.activeProperty && this.activeProperty.id.position.line + 1 === lineNumber) {
                    const documentation = this.checkForDocumentation(tokenBuffer);
                    if (documentation)
                        this.activeProperty.documentation = documentation;
                }
                else if (this.activeMethod && utilities_1.getLineAfter(this.activeMethod) === lineNumber) {
                    const documentation = this.checkForDocumentation(tokenBuffer);
                    if (documentation)
                        this.activeMethod.documentation = documentation;
                }
            }
            else if (this.activeToken.isNewLine())
                continue;
            else
                this.throwAwayTokensTil(13 /* NewLine */);
        }
        return {
            comments: this.comments,
            declarations: this.declarations,
            extending: this.extending,
            pslPackage: this.pslPackage,
            methods: this.methods,
            properties: this.properties,
            tokens: this.tokens,
        };
    }
    next() {
        this.activeToken = this.tokenizer.next().value;
        if (this.activeToken) {
            this.tokens.push(this.activeToken);
            if (this.activeToken.isLineComment() || this.activeToken.isBlockComment()) {
                this.comments.push(this.activeToken);
            }
        }
        return this.activeToken !== undefined;
    }
    checkForDocumentation(tokenBuffer) {
        let i = 0;
        while (i < tokenBuffer.length) {
            const token = tokenBuffer[i];
            if (token.isTab() || token.isSpace()) {
                i++;
                continue;
            }
            if (token.isBlockCommentInit() && tokenBuffer[i + 1] && tokenBuffer[i + 1].isBlockComment()) {
                return tokenBuffer[i + 1].value;
            }
            return '';
        }
    }
    lookForTypeDeclaration(tokenBuffer) {
        let i = 0;
        const tokens = [];
        while (i < tokenBuffer.length) {
            const token = tokenBuffer[i];
            if (token.isTab() || token.isSpace()) {
                i++;
                continue;
            }
            if (token.isAlphanumeric() && token.value === 'type') {
                for (let j = i + 1; j < tokenBuffer.length; j++) {
                    const loadToken = tokenBuffer[j];
                    if (loadToken.isSpace() || loadToken.isTab())
                        continue;
                    // if (loadToken.isEqualSign()) break;
                    tokens.push(loadToken);
                }
            }
            else if (token.isAlphanumeric() && token.value === 'catch') {
                for (let j = i + 1; j < tokenBuffer.length; j++) {
                    const loadToken = tokenBuffer[j];
                    if (loadToken.isSpace() || loadToken.isTab())
                        continue;
                    // if (loadToken.isEqualSign()) break;
                    tokens.push(new tokenizer_1.Token(1 /* Alphanumeric */, 'Error', { character: 0, line: 0 }));
                    tokens.push(loadToken);
                    break;
                }
            }
            break;
        }
        const memberClass = MemberClass.declaration;
        const declarations = [];
        let type;
        let tokenIndex = 0;
        let id;
        let hasType;
        const modifiers = [];
        while (tokenIndex < tokens.length) {
            const token = tokens[tokenIndex];
            tokenIndex++;
            if (this.isDeclarationKeyword(token)) {
                modifiers.push(token);
                continue;
            }
            if (!hasType) {
                if (token.type !== 1 /* Alphanumeric */)
                    break;
                if (token.value === 'static') {
                    modifiers.push(token);
                    hasType = true;
                }
                else {
                    type = token;
                    hasType = true;
                }
                continue;
            }
            else if (token.isAlphanumeric()) {
                id = token;
                if (hasType && !type)
                    type = token;
                // declarations.push({types: [type], identifier});
            }
            else if (token.isEqualSign()) {
                tokenIndex = this.skipToNextDeclaration(tokens, tokenIndex);
                if (id && type)
                    declarations.push({ types: [type], id, memberClass, modifiers });
                id = undefined;
            }
            else if (token.isOpenParen()) {
                const types = [];
                const myIdentifier = tokens[tokenIndex - 2];
                while (tokenIndex < tokens.length) {
                    const arrayTypeToken = tokens[tokenIndex];
                    tokenIndex++;
                    if (arrayTypeToken.isOpenParen())
                        continue;
                    else if (arrayTypeToken.isAlphanumeric()) {
                        types.push(arrayTypeToken);
                    }
                    else if (arrayTypeToken.isComma()) {
                        continue;
                    }
                    else if (arrayTypeToken.isCloseParen()) {
                        if (type)
                            declarations.push({ id: myIdentifier, types: [type].concat(types), memberClass, modifiers });
                        id = undefined;
                        break;
                    }
                }
            }
            // Cheating!!
            // else if (token.isPercentSign()) continue;
            else if (token.isComma()) {
                if (id && type)
                    declarations.push({ types: [type], id, memberClass, modifiers });
                id = undefined;
                continue;
            }
            else if (token.value === '\r')
                continue;
            else if (token.isBlockComment())
                continue;
            else if (token.isBlockCommentInit())
                continue;
            else if (token.isBlockCommentTerm())
                continue;
            else if (token.isNewLine()) {
                if (id && type)
                    declarations.push({ types: [type], id, memberClass, modifiers });
                id = undefined;
                break;
            }
            else
                break;
        }
        if (id && type)
            declarations.push({ types: [type], id, memberClass, modifiers });
        return declarations;
    }
    checkForExtends(tokenBuffer) {
        let i = 0;
        let classDef = false;
        let extending = false;
        let equals = false;
        while (i < tokenBuffer.length) {
            const token = tokenBuffer[i];
            if (token.isTab() || token.isSpace()) {
                i++;
                continue;
            }
            else if (token.isNumberSign() && !classDef) {
                const nextToken = tokenBuffer[i + 1];
                if (!nextToken)
                    return;
                if (nextToken.value === 'CLASSDEF') {
                    classDef = true;
                    i += 2;
                }
                else
                    break;
            }
            else if (token.value === 'extends' && !extending) {
                extending = true;
                i++;
            }
            else if (token.isEqualSign() && !equals) {
                equals = true;
                i++;
            }
            else if (token.isAlphanumeric() && classDef && extending && equals) {
                return token;
            }
            else {
                i++;
            }
        }
        return;
    }
    checkForPSLPackage(tokenBuffer) {
        let i = 0;
        let foundPackageToken = false;
        let fullPackage = '';
        while (i < tokenBuffer.length) {
            const token = tokenBuffer[i];
            if (token.isTab() || token.isSpace()) {
                i++;
                continue;
            }
            else if (token.isNumberSign() && !foundPackageToken) {
                const nextToken = tokenBuffer[i + 1];
                if (!nextToken)
                    return;
                if (nextToken.value === 'PACKAGE') {
                    foundPackageToken = true;
                    i += 2;
                }
                else
                    break;
            }
            else if (token.isAlphanumeric() && foundPackageToken) {
                // TODO: Maybe this should return an ordered list of tokens?
                if (fullPackage === '') {
                    fullPackage = token.value;
                }
                else {
                    fullPackage += ('.' + token.value);
                }
                i++;
            }
            else {
                i++;
            }
        }
        if (fullPackage !== '') {
            return fullPackage;
        }
        return;
    }
    skipToNextDeclaration(identifiers, tokenIndex) {
        let parenStack = 0;
        while (tokenIndex < identifiers.length) {
            const token = identifiers[tokenIndex];
            tokenIndex++;
            if (token.isOpenParen()) {
                parenStack++;
            }
            else if (token.isCloseParen()) {
                parenStack--;
            }
            else if (token.isComma() && parenStack === 0) {
                break;
            }
        }
        return tokenIndex;
    }
    isDeclarationKeyword(token) {
        if (token.type !== 1 /* Alphanumeric */)
            return false;
        const keywords = ['public', 'private', 'new', 'literal'];
        return keywords.indexOf(token.value) !== -1;
    }
    throwAwayTokensTil(type) {
        while (this.next() && this.activeToken.type !== type)
            ;
    }
    loadTokenBuffer() {
        const tokenBuffer = [];
        while (this.next() && this.activeToken.type !== 13 /* NewLine */) {
            tokenBuffer.push(this.activeToken);
        }
        return tokenBuffer;
    }
    lookForPropertyDef(tokenBuffer) {
        let i = 0;
        // TODO better loop
        while (i < tokenBuffer.length) {
            let token = tokenBuffer[i];
            if (token.isTab() || token.isSpace()) {
                i++;
                continue;
            }
            if (token.isNumberSign()) {
                token = tokenBuffer[i + 1];
                if (token && token.value === 'PROPERTYDEF') {
                    const tokens = tokenBuffer.filter(t => {
                        if (t.isNumberSign())
                            return false;
                        if (t.value === 'PROPERTYDEF')
                            return false;
                        return t.type !== 32 /* Space */ && t.type !== 11 /* Tab */;
                    });
                    const classTypes = [];
                    const classIndex = tokens.findIndex(t => t.value === 'class');
                    if (tokens[classIndex + 1]
                        && tokens[classIndex + 1].value === '='
                        && tokens[classIndex + 2]
                        && tokens[classIndex + 2].isAlphanumeric()) {
                        classTypes.push(tokens[classIndex + 2]);
                    }
                    return {
                        id: tokens[0],
                        memberClass: MemberClass.property,
                        modifiers: this.findPropertyModifiers(tokens.slice(1)),
                        types: classTypes,
                    };
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }
        return;
    }
    findPropertyModifiers(tokens) {
        return tokens.filter(t => {
            return t.value === 'private' || t.value === 'literal' || t.value === 'public';
        });
    }
    parseMethod() {
        let batchLabel = false;
        const method = new _Method();
        do {
            if (!this.activeToken)
                continue;
            if (this.activeToken.isTab() || this.activeToken.isSpace())
                continue;
            else if (this.activeToken.isNewLine())
                break;
            else if (this.activeToken.isOpenParen()) {
                const processed = this.processParameters(method);
                if (!processed)
                    return undefined;
                method.parameters = processed;
                break;
            }
            else if (this.activeToken.isAlphanumeric() || this.activeToken.isNumeric()) {
                if (batchLabel) {
                    method.modifiers.push(this.activeToken);
                    method.batch = true;
                    break;
                }
                if (method.line === -1) {
                    method.line = this.activeToken.position.line;
                }
                method.modifiers.push(this.activeToken);
            }
            else if (this.activeToken.isMinusSign()) {
                batchLabel = true;
                continue;
            }
            else if (this.activeToken.isLineCommentInit()
                || this.activeToken.isLineComment()
                || this.activeToken.isBlockCommentInit()
                || this.activeToken.isBlockComment()
                || this.activeToken.isBlockCommentTerm()) {
                continue;
            }
            else if (this.activeToken.value === '\r')
                continue;
            else if (this.activeToken.isCloseParen()) {
                if (!method.closeParen) {
                    method.closeParen = this.activeToken;
                }
            }
            else {
                this.throwAwayTokensTil(13 /* NewLine */);
                if (method.modifiers.length > 1) {
                    break;
                }
                return undefined;
            }
        } while (this.next());
        return this.finalizeMethod(method);
    }
    finalizeMethod(method) {
        for (const keyword of NON_METHOD_KEYWORDS) {
            const index = method.modifiers.map(i => i.value.toLowerCase()).indexOf(keyword.toLowerCase());
            if (index > -1 && index <= method.modifiers.length - 1) {
                method.modifiers = [method.modifiers[0]];
                method.parameters = [];
                break;
            }
        }
        // better way...
        method.id = method.modifiers.pop();
        if (this.activeMethod) {
            this.activeMethod.endLine = method.id.position.line - 1;
        }
        const lastModifier = method.modifiers[method.modifiers.length - 1];
        if (lastModifier && exports.NON_TYPE_MODIFIERS.indexOf(lastModifier.value) < 0) {
            method.types = [method.modifiers.pop()];
        }
        this.activeMethod = method;
        return method;
    }
    processParameters(method) {
        const args = [];
        let param;
        let open = false;
        while (this.next()) {
            if (this.activeToken.isTab() || this.activeToken.isSpace() || this.activeToken.isNewLine())
                continue;
            else if (this.activeToken.isOpenParen()) {
                open = true;
                if (!param)
                    return undefined;
                if (param.types.length === 1 && !param.id) {
                    param.id = param.types[0];
                    param.types[0] = this.getDummy();
                }
                const objectArgs = this.processObjectArgs();
                if (!objectArgs)
                    return undefined;
                param.types = param.types.concat(objectArgs);
                continue;
            }
            else if (this.activeToken.isCloseParen()) {
                open = false;
                method.closeParen = this.activeToken;
                if (!param)
                    break;
                if (param.types.length === 1 && !param.id) {
                    param.id = param.types[0];
                    param.types[0] = this.getDummy();
                }
                args.push(param);
                break;
            }
            else if (this.activeToken.isAlphanumeric()) {
                if (!param)
                    param = new _Parameter();
                // let value = this.activeToken.value;
                if (this.activeToken.value === 'req') {
                    param.modifiers.push(this.activeToken);
                    param.req = true;
                }
                else if (this.activeToken.value === 'ret') {
                    param.modifiers.push(this.activeToken);
                    param.ret = true;
                }
                else if (this.activeToken.value === 'literal') {
                    param.modifiers.push(this.activeToken);
                    param.literal = true;
                }
                else if (!param.types)
                    param.types = [this.activeToken];
                else {
                    param.id = this.activeToken;
                }
            }
            else if (this.activeToken.isLineComment()) {
                if (param) {
                    param.comment = this.activeToken;
                }
                else if (args.length >= 1) {
                    args[args.length - 1].comment = this.activeToken;
                }
            }
            else if (this.activeToken.isComma()) {
                if (!param)
                    return undefined;
                if (param.types.length === 1 && !param.id) {
                    param.id = param.types[0];
                    param.types[0] = this.getDummy();
                }
                args.push(param);
                param = undefined;
            }
        }
        if (open)
            return undefined;
        return args;
    }
    processObjectArgs() {
        const types = [];
        let found = false;
        while (this.next()) {
            const dummy = this.getDummy();
            if (this.activeToken.isTab() || this.activeToken.isSpace())
                continue;
            else if (this.activeToken.isCloseParen()) {
                if (types.length === 0)
                    types.push(dummy);
                return types;
            }
            else if (this.activeToken.isAlphanumeric()) {
                if (!found) {
                    types.push(this.activeToken);
                    found = true;
                }
                else
                    return undefined;
            }
            else if (this.activeToken.isComma()) {
                if (!found) {
                    if (types.length === 0) {
                        types.push(dummy);
                    }
                    types.push(dummy);
                }
                found = false;
                continue;
            }
        }
        return undefined;
    }
    parseStatementsOnLine(tokenBuffer) {
        const statementParser = new statementParser_1.StatementParser(tokenBuffer);
        try {
            return statementParser.parseLine();
        }
        catch (_a) {
            return [];
        }
    }
    getDummy() {
        return new tokenizer_1.Token(-1 /* Undefined */, '', this.activeToken.position);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhcnNlci9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBeUI7QUFDekIsdURBQStEO0FBQy9ELDJDQUFxRDtBQUNyRCwyQ0FBMkM7QUFFM0M7O0dBRUc7QUFDSCxJQUFZLFdBUVg7QUFSRCxXQUFZLFdBQVc7SUFDdEIsaURBQVUsQ0FBQTtJQUNWLHVEQUFhLENBQUE7SUFDYixxREFBWSxDQUFBO0lBQ1osMkRBQWUsQ0FBQTtJQUNmLGlEQUFVLENBQUE7SUFDViwrQ0FBUyxDQUFBO0lBQ1QsNkNBQVEsQ0FBQTtBQUNULENBQUMsRUFSVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQVF0QjtBQTZLRCxzQ0FBc0M7QUFDdEMsTUFBTSxPQUFPO0lBZVo7UUFDQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7UUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdEIsQ0FBQztDQUNEO0FBRUQsc0NBQXNDO0FBQ3RDLE1BQU0sVUFBVTtJQVVmO1FBQ0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDakIsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENB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