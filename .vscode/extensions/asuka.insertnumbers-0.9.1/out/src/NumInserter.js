/////<reference path="./sprintf.js" />
'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var TSSprintf_1 = require('./TSSprintf');
/**
 * InsertSettngs
 */
var InsertSettngs = (function () {
    function InsertSettngs() {
        var subscriptions = [];
        vscode.workspace.onDidChangeConfiguration(this.updateSettings, this, subscriptions);
        this._disposable = (_a = vscode.Disposable).from.apply(_a, subscriptions);
        this.updateSettings();
        var _a;
    }
    InsertSettngs.prototype.updateSettings = function () {
        var settings = vscode.workspace.getConfiguration("insertnum");
        if (!settings) {
            return;
        }
        //TODO: format check.
        this.formatStr = settings.get("formatstr");
        if (!this.formatStr) {
            this.formatStr = "%d";
        }
        this.start = settings.get("start");
        if (!this.start) {
            this.start = 0;
        }
        this.step = settings.get("step");
        if (!this.step) {
            this.step = 1;
        }
    };
    InsertSettngs.prototype.dispose = function () {
        this._disposable.dispose();
    };
    return InsertSettngs;
}());
exports.InsertSettngs = InsertSettngs;
/**
 * NumInserter
 */
var NumInserter = (function () {
    function NumInserter(settings) {
        this._settings = settings;
    }
    NumInserter.prototype.insertNumbers = function (settings) {
        var textEditor = vscode.window.activeTextEditor;
        var selections = textEditor.selections;
        var formatStr = settings.formatStr;
        var start = settings.start;
        var step = settings.step;
        var cur = start;
        textEditor.edit(function (builder) {
            for (var i = 0; i < selections.length; i++) {
                var str = TSSprintf_1.TSSprintf.sprintf(formatStr, cur);
                cur += step;
                builder.replace(selections[i], str);
            }
        });
    };
    NumInserter.prototype.parseUserInput = function (input) {
        if (!input) {
            return;
        }
        var retSettings = {
            formatStr: "%d",
            start: 0,
            step: 1
        };
        //A simple check. :)
        if (!input.includes("%")) {
            vscode.window.showErrorMessage("Wrong format string.");
            return;
        }
        // eg... "%d:1:2"
        if (input.includes(":")) {
            var paramList = input.split(":", 3);
            retSettings.formatStr = paramList[0];
            var strStart = paramList[1];
            var strStep = paramList[2];
            if (strStart.includes(".")) {
                retSettings.start = parseFloat(strStart);
            }
            else {
                retSettings.start = parseInt(strStart);
            }
            if (strStep.includes(".")) {
                retSettings.step = parseFloat(strStep);
            }
            else {
                retSettings.step = parseInt(strStep);
            }
        }
        else {
            retSettings.formatStr = input;
        }
        return retSettings;
    };
    NumInserter.prototype.processInsert = function () {
        //Input default numbers first.
        this.insertNumbers(this._settings);
        var opt = {
            placeHolder: "default: %d:0:1",
            prompt: "Input format or format:start:step"
        };
        var input = vscode.window.showInputBox(opt);
        if (!input) {
            return;
        }
        var parseUserInput = this.parseUserInput;
        var insertNumbers = this.insertNumbers;
        var newSettings = null;
        input.then(function (val) {
            newSettings = parseUserInput(val);
            if (!newSettings) {
                return;
            }
            insertNumbers(newSettings);
        });
    };
    NumInserter.prototype.dispose = function () {
        this._settings.dispose();
    };
    return NumInserter;
}());
exports.NumInserter = NumInserter;
//# sourceMappingURL=NumInserter.js.map