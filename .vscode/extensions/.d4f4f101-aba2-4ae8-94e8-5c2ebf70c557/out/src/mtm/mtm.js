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
const hostSocket_1 = require("./hostSocket");
const utils = require("./utils");
const fs = require("fs");
var ServiceClass;
(function (ServiceClass) {
    ServiceClass[ServiceClass["CONNECTION"] = 0] = "CONNECTION";
    ServiceClass[ServiceClass["MRPC"] = 3] = "MRPC";
    ServiceClass[ServiceClass["SQL"] = 5] = "SQL";
})(ServiceClass || (ServiceClass = {}));
class MtmConnection {
    constructor(serverType = 'SCA$IBS', encoding = 'utf8') {
        this.serverType = serverType;
        this.encoding = encoding;
        this.socket = new hostSocket_1.default();
        this.messageByte = String.fromCharCode(28);
        this.token = '';
        this.messageId = 0;
        this.maxRow = 30;
        this.isSql = false;
        this.recordCount = 0;
    }
    open(host, port, profileUsername, profilePassword) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.socket.connect(port, host);
            let prepareString = utils.connectionObject(profileUsername, profilePassword);
            let returnArray = yield this.execute({ serviceClass: ServiceClass.CONNECTION }, prepareString);
            this.token = returnArray;
        });
    }
    send(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let codeToken = yield this._send(fileName);
                let returnString = yield this.saveInProfile(fileName, codeToken);
                if (returnString !== '1') {
                    throw new Error(returnString.split('\r\n')[1]);
                }
                return returnString;
            }
            catch (err) {
                this.close();
                throw new Error(err.toString());
            }
        });
    }
    testCompile(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let codeToken = yield this._send(fileName);
                let returnString = yield this._testCompile(fileName, codeToken);
                return returnString;
            }
            catch (err) {
                this.close();
                throw new Error(err.toString());
            }
        });
    }
    get(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let returnString = yield this._get(fileName);
                return returnString;
            }
            catch (err) {
                this.close();
                throw new Error(err.toString());
            }
        });
    }
    compileAndLink(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let returnString = yield this._compileAndLink(fileName);
                return returnString;
            }
            catch (err) {
                this.close();
                throw new Error(err.toString());
            }
        });
    }
    runPsl(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let codeToken = yield this._send(fileName);
                let returnString = yield this._runPsl(codeToken);
                return returnString;
            }
            catch (err) {
                this.close();
                throw new Error(err.toString());
            }
        });
    }
    runCustom(fileName, mrpcID, request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const codeToken = yield this._send(fileName);
                const returnString = yield this._runCustom(codeToken, mrpcID, request);
                return returnString;
            }
            catch (err) {
                this.close();
                throw new Error(err.toString());
            }
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.socket.closeConnection();
            return this.socket.socket.destroyed;
        });
    }
    batchcomp(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let returnString = yield this.batchCompileAndLink(fileName);
                return returnString;
            }
            catch (err) {
                this.close();
                throw new Error(err.toString());
            }
        });
    }
    getTable(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.isSql = false;
                let returnString = yield this._getTable(fileName);
                return returnString;
            }
            catch (err) {
                this.close();
                throw new Error(err.toString());
            }
        });
    }
    sqlQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.isSql = true;
                let returnString = yield this._sqlQuery(query);
                return returnString;
            }
            catch (err) {
                this.close();
                throw new Error(err.toString());
            }
        });
    }
    getPSLClasses() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let returnString = yield this._getPslClasses();
                return returnString;
            }
            catch (err) {
                this.close();
                throw new Error(err.toString());
            }
        });
    }
    _send(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnString;
            let fileString = yield readFileAsync(filename, { encoding: this.encoding });
            let fileContentLength = fileString.length;
            let totalLoop = Math.ceil(fileContentLength / 1024);
            let codeToken = '';
            for (let i = 0; i < totalLoop; i++) {
                let partialString = fileString.slice(i * 1024, (i * 1024) + 1024);
                let withPipe = '';
                for (const char of partialString) {
                    withPipe += char.charCodeAt(0) + '|';
                }
                let prepareString = utils.initCodeObject(withPipe, codeToken);
                returnString = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
                codeToken = returnString;
            }
            let prepareString = utils.initCodeObject('', codeToken);
            returnString = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
            return returnString;
        });
    }
    saveInProfile(fileName, codeToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnString;
            let fileDetails = utils.getObjectType(fileName);
            let prepareString = utils.saveObject(fileDetails.fileBaseName, codeToken, utils.getUserName());
            returnString = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
            return returnString;
        });
    }
    _testCompile(fileName, codeToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnString;
            let fileDetails = utils.getObjectType(fileName);
            let prepareString = utils.testCompileObject(fileDetails.fileBaseName, codeToken);
            returnString = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
            return returnString;
        });
    }
    _get(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnString;
            let fileDetails = utils.getObjectType(fileName);
            let prepareString = utils.initObject(fileDetails.fileId, fileDetails.fileName);
            returnString = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
            let codeToken = returnString.split('\r\n')[1];
            let hasMore = '1';
            returnString = '';
            while (hasMore === '1') {
                prepareString = utils.retObject(codeToken);
                let nextReturnString = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
                hasMore = nextReturnString.substr(0, 1);
                returnString = returnString + nextReturnString.substr(1, nextReturnString.length);
            }
            return returnString;
        });
    }
    _compileAndLink(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnString;
            let fileDetails = utils.getObjectType(fileName);
            let prepareString = utils.preCompileObject(fileDetails.fileBaseName);
            let codeToken = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
            prepareString = utils.compileObject(codeToken);
            returnString = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
            return returnString;
        });
    }
    _runPsl(codeToken) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnString;
            let prepareString = utils.pslRunObject(codeToken);
            returnString = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
            return returnString;
        });
    }
    _runCustom(codeToken, mrpcID, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnString;
            let prepareString = utils.customRunObject(request, codeToken);
            returnString = yield this.execute({ mrpcID, serviceClass: ServiceClass.MRPC }, prepareString);
            return returnString;
        });
    }
    // Batch complie is not working since 81 is not fully exposed from profile
    batchCompileAndLink(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnString;
            let fileDetails = utils.getObjectType(fileName);
            let dbtblTableName = utils.getDbtblInfo(fileDetails.fileId);
            let prepareString = utils.batchCompileObject(dbtblTableName, fileDetails.fileName);
            returnString = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
            return returnString;
        });
    }
    _getTable(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnString;
            let columnList;
            let fileDetails = utils.getObjectType(fileName);
            let tableReturnString = fileDetails.fileBaseName + String.fromCharCode(1) + (yield this._get(fileName));
            let selectStatement = `SELECT COUNT(DI) FROM DBTBL1D WHERE FID='${fileDetails.fileName}' `;
            this.recordCount = Number(yield this._sqlQuery(selectStatement));
            selectStatement = `SELECT DI FROM DBTBL1D WHERE FID='${fileDetails.fileName}'`;
            returnString = yield this._sqlQuery(selectStatement);
            columnList = returnString.split('\r\n');
            returnString = tableReturnString;
            for (let i = 0; i < columnList.length; i++) {
                fileName = fileDetails.fileName + '-' + columnList[i] + '.COL';
                returnString = returnString + String.fromCharCode(0) + fileName + String.fromCharCode(1) + (yield this._get(fileName));
            }
            return returnString;
        });
    }
    _sqlQuery(selectQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            selectQuery = selectQuery.toUpperCase();
            if (!selectQuery.startsWith('SELECT')) {
                throw new Error('Not a select query');
            }
            let cursorNumber = new Date().getTime().toString();
            let returnString = yield this.openSqlCursor(cursorNumber, selectQuery);
            returnString = yield this.fetchSqlCursor(cursorNumber);
            yield this.closeSqlCursor(cursorNumber);
            return returnString;
        });
    }
    openSqlCursor(cursorNumber, selectQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            let openCursor = 'OPEN CURSOR ' + cursorNumber + ' AS ';
            let rows = '';
            let prepareString = utils.sqlObject(openCursor + selectQuery, rows);
            let returnString = yield this.execute({ serviceClass: ServiceClass.SQL }, prepareString);
            return returnString;
        });
    }
    fetchSqlCursor(cursorNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            let fetchCursor = 'FETCH ' + cursorNumber;
            let rows = 'ROWS=' + this.maxRow;
            let prepareString = utils.sqlObject(fetchCursor, rows);
            let returnString = yield this.execute({ serviceClass: ServiceClass.SQL }, prepareString);
            let splitReturnSring = returnString.split(String.fromCharCode(0));
            let totalCount = Number(splitReturnSring[0]);
            returnString = splitReturnSring[1];
            if (this.isSql === false) {
                while ((totalCount < this.recordCount)) {
                    splitReturnSring = [];
                    let nextReturnString = yield this.execute({ serviceClass: ServiceClass.SQL }, prepareString);
                    splitReturnSring = nextReturnString.split(String.fromCharCode(0));
                    totalCount = totalCount + Number(splitReturnSring[0]);
                    returnString = returnString + '\r\n' + splitReturnSring[1];
                }
            }
            return returnString;
        });
    }
    closeSqlCursor(cursorNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            let closeCursor = 'CLOSE ' + cursorNumber;
            let prepareString = utils.sqlObject(closeCursor, '');
            let returnString = yield this.execute({ serviceClass: ServiceClass.SQL }, prepareString);
            return returnString;
        });
    }
    _getPslClasses() {
        return __awaiter(this, void 0, void 0, function* () {
            let returnString;
            let prepareString = utils.getPslCls();
            returnString = yield this.execute({ mrpcID: '121', serviceClass: ServiceClass.MRPC }, prepareString);
            return returnString;
        });
    }
    execute(detail, prepareString) {
        return __awaiter(this, void 0, void 0, function* () {
            const sendingMessage = this.prepareSendingMessage(detail, prepareString);
            yield this.socket.send(sendingMessage);
            let message = yield this.socket.onceData();
            const { totalBytes, startByte } = utils.unpack(message);
            let messageLength = message.length;
            while (messageLength < totalBytes) {
                const nextMessage = yield this.socket.onceData();
                messageLength = messageLength + nextMessage.length;
                message = Buffer.concat([message, nextMessage], messageLength);
            }
            return (utils.parseResponse(detail.serviceClass, message.slice(startByte, message.length), this.encoding));
        });
    }
    prepareSendingMessage(detail, prepareString) {
        let tokenMessage = utils.tokenMessage(detail.serviceClass, this.token, this.messageId);
        if (detail.serviceClass === ServiceClass.MRPC) {
            let version = 1;
            prepareString = utils.mrpcMessage(detail.mrpcID, version.toString(), prepareString);
        }
        let sendingMessage = utils.sendingMessage(tokenMessage, prepareString);
        sendingMessage = this.serverType + this.messageByte + sendingMessage;
        sendingMessage = utils.pack(sendingMessage.length + 2) + sendingMessage;
        this.messageId++;
        return sendingMessage;
    }
}
exports.MtmConnection = MtmConnection;
function readFileAsync(file, options) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, options, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXRtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL210bS9tdG0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBc0M7QUFDdEMsaUNBQWlDO0FBQ2pDLHlCQUF5QjtBQUV6QixJQUFLLFlBSUo7QUFKRCxXQUFLLFlBQVk7SUFDaEIsMkRBQWMsQ0FBQTtJQUNkLCtDQUFRLENBQUE7SUFDUiw2Q0FBTyxDQUFBO0FBQ1IsQ0FBQyxFQUpJLFlBQVksS0FBWixZQUFZLFFBSWhCO0FBT0QsTUFBYSxhQUFhO0lBVXpCLFlBQW9CLGFBQXFCLFNBQVMsRUFBVSxXQUEyQixNQUFNO1FBQXpFLGVBQVUsR0FBVixVQUFVLENBQW9CO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBeUI7UUFSckYsV0FBTSxHQUFlLElBQUksb0JBQVUsRUFBRSxDQUFBO1FBQ3JDLGdCQUFXLEdBQVcsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5QyxVQUFLLEdBQVcsRUFBRSxDQUFDO1FBQ25CLGNBQVMsR0FBVyxDQUFDLENBQUM7UUFDdEIsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixVQUFLLEdBQVksS0FBSyxDQUFDO1FBQ3ZCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO0lBRWlFLENBQUM7SUFFNUYsSUFBSSxDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsZUFBdUIsRUFBRSxlQUF1Qjs7WUFDdEYsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdEMsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUM3RSxJQUFJLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLFVBQVUsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lB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