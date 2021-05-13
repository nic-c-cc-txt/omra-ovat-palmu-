"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function* getTokens(documentContents) {
    const t = new Tokenizer();
    for (const char of documentContents) {
        t.charType = getType(char);
        if (t.tokenType === 0) {
            t.tokenType = t.charType;
        }
        while (!t.parsed) {
            if (t.parseCharacter(char)) {
                yield t.token;
            }
        }
        t.parsed = false;
    }
    if (t.tokenType !== 0) { // if there is an unfinished token left
        t.finalizeToken(0);
        yield t.token;
    }
}
exports.getTokens = getTokens;
class Token {
    constructor(type, value, position) {
        this.position = position;
        this.value = value;
        this.type = type;
    }
    getRange() {
        const startPosition = this.position;
        const endPosition = { line: this.position.line, character: this.position.character + this.value.length };
        return new Range(startPosition, endPosition);
    }
    isWhiteSpace() {
        return this.type === 32 /* Space */
            || this.type === 11 /* Tab */
            || this.type === 13 /* NewLine */
            || this.type === -1 /* Undefined */;
    }
    isAlphanumeric() {
        return this.type === 1 /* Alphanumeric */;
    }
    isNumeric() {
        return this.type === 2 /* Numeric */;
    }
    isLineComment() {
        return this.type === 3 /* LineComment */;
    }
    isBlockComment() {
        return this.type === 4 /* BlockComment */;
    }
    isString() {
        return this.type === 5 /* String */;
    }
    isLineCommentInit() {
        return this.type === 6 /* LineCommentInit */;
    }
    isBlockCommentInit() {
        return this.type === 7 /* BlockCommentInit */;
    }
    isBlockCommentTerm() {
        return this.type === 8 /* BlockCommentTerm */;
    }
    isDoubleQuotes() {
        return this.type === 9 /* DoubleQuotes */;
    }
    isSlash() {
        return this.type === 10 /* Slash */;
    }
    isTab() {
        return this.type === 11 /* Tab */;
    }
    isNewLine() {
        return this.type === 13 /* NewLine */;
    }
    isSpace() {
        return this.type === 32 /* Space */;
    }
    isExclamationMark() {
        return this.type === 33 /* ExclamationMark */;
    }
    isNumberSign() {
        return this.type === 35 /* NumberSign */;
    }
    isDollarSign() {
        return this.type === 36 /* DollarSign */;
    }
    isAmpersand() {
        return this.type === 38 /* Ampersand */;
    }
    isSingleQuote() {
        return this.type === 39 /* SingleQuote */;
    }
    isOpenParen() {
        return this.type === 40 /* OpenParen */;
    }
    isCloseParen() {
        return this.type === 41 /* CloseParen */;
    }
    isAsterisk() {
        return this.type === 42 /* Asterisk */;
    }
    isPlusSign() {
        return this.type === 43 /* PlusSign */;
    }
    isComma() {
        return this.type === 44 /* Comma */;
    }
    isMinusSign() {
        return this.type === 45 /* MinusSign */;
    }
    isPeriod() {
        return this.type === 46 /* Period */;
    }
    isColon() {
        return this.type === 58 /* Colon */;
    }
    isSemiColon() {
        return this.type === 59 /* SemiColon */;
    }
    isLessThan() {
        return this.type === 60 /* LessThan */;
    }
    isEqualSign() {
        return this.type === 61 /* EqualSign */;
    }
    isGreaterThan() {
        return this.type === 62 /* GreaterThan */;
    }
    isQuestionMark() {
        return this.type === 63 /* QuestionMark */;
    }
    isAtSymbol() {
        return this.type === 64 /* AtSymbol */;
    }
    isOpenBracket() {
        return this.type === 91 /* OpenBracket */;
    }
    isBackslash() {
        return this.type === 92 /* Backslash */;
    }
    isCloseBracket() {
        return this.type === 93 /* CloseBracket */;
    }
    isCaret() {
        return this.type === 94 /* Caret */;
    }
    isUnderscore() {
        return this.type === 95 /* Underscore */;
    }
    isBackQuote() {
        return this.type === 96 /* BackQuote */;
    }
    isOpenBrace() {
        return this.type === 123 /* OpenBrace */;
    }
    isPipe() {
        return this.type === 124 /* Pipe */;
    }
    isCloseBrace() {
        return this.type === 125 /* CloseBrace */;
    }
    isTilde() {
        return this.type === 126 /* Tilde */;
    }
}
exports.Token = Token;
class Range {
    constructor(a, b, c, d) {
        if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number' && typeof d === 'number') {
            this.start = new Position(a, b);
            this.end = new Position(c, d);
        }
        else {
            this.start = a;
            this.end = b;
        }
    }
}
exports.Range = Range;
class Position {
    /**
     * @param line A zero-based line value.
     * @param character A zero-based character value.
     */
    constructor(line, character) {
        this.line = line;
        this.character = character;
    }
}
exports.Position = Position;
class Tokenizer {
    constructor() {
        this.documentLine = 0;
        this.documentColumn = 0;
        this.charType = 0;
        this.tokenType = 0;
        this.tokenValue = '';
        this.tokenPosition = { line: this.documentLine, character: this.documentColumn };
        this.parsed = false;
        this.stringOpen = false;
        this.firstSlash = false;
        this.asterisk = false;
    }
    parseCharacter(char) {
        if (this.tokenType === 1 /* Alphanumeric */) {
            if (this.charType === 1 /* Alphanumeric */ || this.charType === 2 /* Numeric */) {
                this.tokenValue = this.tokenValue + char;
                this.parsed = true;
                this.documentColumn++;
                return false;
            }
            else {
                this.finalizeToken(this.charType);
                return true;
            }
        }
        else if (this.tokenType === 2 /* Numeric */) {
            if (this.charType === 2 /* Numeric */) {
                this.tokenValue = this.tokenValue + char;
                this.parsed = true;
                this.documentColumn++;
                return false;
            }
            else {
                this.finalizeToken(this.charType);
                return true;
            }
        }
        else if (this.tokenType === 3 /* LineComment */) {
            if (this.charType === 13 /* NewLine */) {
                this.finalizeToken(13 /* NewLine */);
                return true;
            }
            else {
                this.tokenValue = this.tokenValue + char;
                this.parsed = true;
                this.documentColumn++;
                return false;
            }
        }
        else if (this.tokenType === 4 /* BlockComment */) {
            if (this.asterisk) { // the previous char is *
                this.asterisk = false;
                if (this.charType === 10 /* Slash */) { // the last two chars are * /
                    this.finalizeToken(8 /* BlockCommentTerm */);
                    this.tokenValue = this.tokenValue + '*'; // add the * that was not yet added to the token
                    this.documentColumn++;
                    return true;
                }
                else {
                    this.tokenValue = this.tokenValue + '*'; // add the * that was not yet added to the token
                    this.documentColumn++;
                }
            }
            // do not add a * to the token immediately, it could be the end of a block comment
            if (this.charType === 42 /* Asterisk */) {
                this.asterisk = true;
            }
            else {
                this.tokenValue = this.tokenValue + char;
                if (this.charType === 13 /* NewLine */) {
                    this.documentLine++;
                    this.documentColumn = 0;
                }
                else {
                    this.documentColumn++;
                }
            }
            this.parsed = true;
            return false;
        }
        else if (this.tokenType === 5 /* String */) {
            if (this.charType === 9 /* DoubleQuotes */) {
                this.finalizeToken(9 /* DoubleQuotes */);
                return true;
            }
            else {
                this.tokenValue = this.tokenValue + char;
                this.parsed = true;
                if (this.charType === 13 /* NewLine */) {
                    this.documentLine++;
                    this.documentColumn = 0;
                }
                else {
                    this.documentColumn++;
                }
                return false;
            }
        }
        else if (this.tokenType === 6 /* LineCommentInit */) {
            this.tokenValue = this.tokenValue + char;
            this.parsed = true;
            this.documentColumn++;
            this.finalizeToken(3 /* LineComment */);
            return true;
        }
        else if (this.tokenType === 7 /* BlockCommentInit */) {
            this.tokenValue = this.tokenValue + char;
            this.parsed = true;
            this.documentColumn++;
            this.finalizeToken(4 /* BlockComment */);
            return true;
        }
        else if (this.tokenType === 8 /* BlockCommentTerm */) {
            this.tokenValue = this.tokenValue + char;
            this.parsed = true;
            this.documentColumn++;
            this.finalizeToken(0);
            return true;
        }
        else if (this.tokenType === 9 /* DoubleQuotes */) {
            this.tokenValue = this.tokenValue + char;
            this.parsed = true;
            this.documentColumn++;
            if (this.stringOpen) {
                this.stringOpen = false;
                this.finalizeToken(0);
            }
            else {
                this.stringOpen = true;
                this.finalizeToken(5 /* String */);
            }
            return true;
        }
        else if (this.tokenType === 10 /* Slash */ || this.tokenType === 59 /* SemiColon */) {
            if (this.tokenType === 59 /* SemiColon */) {
                this.tokenType = 6 /* LineCommentInit */;
                return false;
            }
            else if (this.firstSlash) {
                this.firstSlash = false;
                if (this.charType === 10 /* Slash */) {
                    this.tokenType = 6 /* LineCommentInit */;
                    return false;
                }
                else if (this.charType === 42 /* Asterisk */) {
                    this.tokenType = 7 /* BlockCommentInit */;
                    return false;
                }
                else {
                    this.finalizeToken(this.charType);
                    return true;
                }
            }
            else {
                this.firstSlash = true;
                this.tokenValue = this.tokenValue + char;
                this.parsed = true;
                this.documentColumn++;
                return false;
            }
        }
        else if (this.tokenType === 13 /* NewLine */) {
            this.tokenValue = this.tokenValue + char;
            this.parsed = true;
            this.documentLine++;
            this.documentColumn = 0;
            this.finalizeToken(0);
            return true;
        }
        else if (this.tokenType > 10) { // all other token types
            this.tokenValue = this.tokenValue + char;
            this.parsed = true;
            this.documentColumn++;
            this.finalizeToken(0);
            return true;
        }
        else if (this.tokenType === -1) { // undefined
            this.tokenValue = this.tokenValue + char;
            this.parsed = true;
            this.documentColumn++;
            this.finalizeToken(0);
            return true;
        }
        return false;
    }
    finalizeToken(newType) {
        this.token = new Token(this.tokenType, this.tokenValue, this.tokenPosition);
        this.tokenType = newType;
        this.tokenValue = '';
        this.tokenPosition = { line: this.documentLine, character: this.documentColumn };
    }
}
function getType(c) {
    const charCode = c.charCodeAt(0);
    // Find a better way to incorporate the %
    if (charCode >= 65 && charCode <= 90 || charCode >= 97 && charCode <= 122 || charCode === 37) {
        return 1 /* Alphanumeric */;
    }
    else if (charCode >= 48 && charCode <= 57) {
        return 2 /* Numeric */;
    }
    else if (charCode === 34) {
        return 9 /* DoubleQuotes */;
    }
    else if (charCode === 47) {
        return 10 /* Slash */;
    }
    else if (charCode === 9) {
        return 11 /* Tab */;
    }
    else if (charCode === 10) {
        return 13 /* NewLine */;
    }
    else if (charCode === 32) {
        return 32 /* Space */;
    }
    else if (charCode === 33) {
        return 33 /* ExclamationMark */;
    }
    else if (charCode === 35) {
        return 35 /* NumberSign */;
    }
    else if (charCode === 36) {
        return 36 /* DollarSign */;
        // } else if (charCode === 37) {
        // 	return Type.PercentSign;
    }
    else if (charCode === 38) {
        return 38 /* Ampersand */;
    }
    else if (charCode === 39) {
        return 39 /* SingleQuote */;
    }
    else if (charCode === 40) {
        return 40 /* OpenParen */;
    }
    else if (charCode === 41) {
        return 41 /* CloseParen */;
    }
    else if (charCode === 42) {
        return 42 /* Asterisk */;
    }
    else if (charCode === 43) {
        return 43 /* PlusSign */;
    }
    else if (charCode === 44) {
        return 44 /* Comma */;
    }
    else if (charCode === 45) {
        return 45 /* MinusSign */;
    }
    else if (charCode === 46) {
        return 46 /* Period */;
    }
    else if (charCode === 58) {
        return 58 /* Colon */;
    }
    else if (charCode === 59) {
        return 59 /* SemiColon */;
    }
    else if (charCode === 60) {
        return 60 /* LessThan */;
    }
    else if (charCode === 61) {
        return 61 /* EqualSign */;
    }
    else if (charCode === 62) {
        return 62 /* GreaterThan */;
    }
    else if (charCode === 63) {
        return 63 /* QuestionMark */;
    }
    else if (charCode === 64) {
        return 64 /* AtSymbol */;
    }
    else if (charCode === 91) {
        return 91 /* OpenBracket */;
    }
    else if (charCode === 92) {
        return 92 /* Backslash */;
    }
    else if (charCode === 93) {
        return 93 /* CloseBracket */;
    }
    else if (charCode === 94) {
        return 94 /* Caret */;
    }
    else if (charCode === 95) {
        return 95 /* Underscore */;
    }
    else if (charCode === 96) {
        return 96 /* BackQuote */;
    }
    else if (charCode === 123) {
        return 123 /* OpenBrace */;
    }
    else if (charCode === 124) {
        return 124 /* Pipe */;
    }
    else if (charCode === 125) {
        return 125 /* CloseBrace */;
    }
    else if (charCode === 126) {
        return 126 /* Tilde */;
    }
    else {
        return -1 /* Undefined */;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BhcnNlci90b2tlbml6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxRQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsZ0JBQXdCO0lBQ2xELE1BQU0sQ0FBQyxHQUFjLElBQUksU0FBUyxFQUFFLENBQUM7SUFFckMsS0FBSyxNQUFNLElBQUksSUFBSSxnQkFBZ0IsRUFBRTtRQUNwQyxDQUFDLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsQ0FBQyxTQUFTLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUN6QjtRQUNELE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDM0IsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO2FBQ2Q7U0FDRDtRQUNELENBQUMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0tBQ2pCO0lBQ0QsSUFBSSxDQUFDLENBQUMsU0FBUyxLQUFLLENBQUMsRUFBRSxFQUFFLHVDQUF1QztRQUMvRCxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztLQUNkO0FBQ0YsQ0FBQztBQW5CRCw4QkFtQkM7QUFFRCxNQUFhLEtBQUs7SUFLakIsWUFBWSxJQUFVLEVBQUUsS0FBYSxFQUFFLFFBQWtCO1FBQ3hELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxRQUFRO1FBQ1AsTUFBTSxhQUFhLEdBQWEs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