"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const Entities = require('html-entities').AllHtmlEntities;
var removeDiacritics = require('diacritics').remove;
var titleCase = require('title-case');
const entities = new Entities();
exports.Utils = {
    htmlEncode: (text) => {
        return entities.encode(text);
    },
    htmlDecode: (text) => {
        return entities.decode(text);
    },
    urlEncode: (text) => {
        return encodeURIComponent(text);
    },
    urlDecode: (text) => {
        return decodeURIComponent(text);
    },
    toTitleCase: (text) => {
        return titleCase(text);
    },
    toLowerCase: (text) => {
        return text.toLowerCase();
    },
    toUpperCase: (text) => {
        return text.toUpperCase();
    },
    capitalizeFirstLetter: (text) => {
        text = text.toLowerCase();
        return text.charAt(0).toUpperCase() + text.slice(1);
    },
    reverse: (text) => {
        return text.split("").reverse().join("");
    },
    removeAccent: (text) => {
        return removeDiacritics(text);
    },
    toMd5: (text) => {
        return crypto.createHash("md5").update(text).digest("hex");
    },
    toSha1: (text) => {
        return crypto.createHash("sha1").update(text).digest("hex");
    },
    toSha256: (text) => {
        return crypto.createHash("sha256").update(text).digest("hex");
    },
    toSha384: (text) => {
        return crypto.createHash("sha384").update(text).digest("hex");
    },
    toSha512: (text) => {
        return crypto.createHash("sha512").update(text).digest("hex");
    },
    sortAscending: (text) => {
        let pieces = text.split("\n");
        pieces = pieces.filter(function (n) { return n !== "" && n !== null; });
        pieces = pieces.sort();
        return `${pieces.slice(0, -1).join('\n')}\n${pieces.slice(-1)}`;
    },
    sortDescending: (text) => {
        let pieces = text.split("\n");
        pieces = pieces.filter(function (n) { return n !== "" && n !== null; });
        pieces = pieces.sort().reverse();
        return `${pieces.slice(0, -1).join('\n')}\n${pieces.slice(-1)}`;
    },
    removeEmptyLines: (text) => {
        return text.replace(/^\s*$(?:\r\n?|\n)/gm, "");
    },
    removeHorizontalWhiteSpace: (text) => {
        const pieces = text.split("\n");
        let result = [];
        pieces.forEach((piece, i) => {
            piece = piece.replace(/^\s+|\s+$/g, '');
            result.push(piece);
        });
        return `${result.slice(0, -1).join('\n')}\n${result.slice(-1)}`;
    },
    removeDuplicateLines: (text) => {
        const pieces = text.split("\n");
        let dummyArray = [];
        let index = [];
        let result = [];
        pieces.forEach((piece, i) => {
            piece = piece.replace(/^\s+|\s+$/g, '');
            piece = piece.toLowerCase();
            if (piece === '<br>' || piece === '<br/>' || piece === '<br />' || dummyArray.indexOf(piece) < 0) {
                index.push(i);
                dummyArray.push(piece);
            }
        });
        index.forEach((i) => { result.push(pieces[i]); });
        return `${result.slice(0, -1).join('\n')}\n${result.slice(-1)}`;
    }
};
//# sourceMappingURL=Utils.js.map