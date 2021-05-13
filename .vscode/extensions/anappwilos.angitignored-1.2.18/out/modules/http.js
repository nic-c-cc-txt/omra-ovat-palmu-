"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("https");
const url_1 = require("url");
function httpGet(url) {
    const { protocol, hostname, path } = url_1.parse(url);
    return new Promise((resolve, reject) => {
        let data = "";
        http
            .get({ protocol, hostname, path }, res => {
            res.on("data", chunk => (data += chunk));
            res.on("end", () => resolve(data));
            res.on("close", () => reject());
        })
            .on("error", () => reject());
    });
}
exports.httpGet = httpGet;
function getData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return Promise.resolve(yield httpGet(url));
        }
        catch (e) {
            return Promise.resolve(null);
        }
    });
}
exports.getData = getData;
//# sourceMappingURL=http.js.map