'use strict'

const vscode = require('vscode')
const Range = vscode.Range
const Position = vscode.Position
const Selection = vscode.Selection

exports.activate = function activate (context) {
  vscode.commands.registerCommand('extension.increment', increment)
  vscode.commands.registerCommand('extension.decrement', decrement)
  vscode.commands.registerCommand('extension.incrementBy10', incrementBy10)
  vscode.commands.registerCommand('extension.decrementBy10', decrementBy10)
}

exports.deactivate = function deactivate () {}

function loopSelections (fn) {
  const editor = vscode.window.activeTextEditor
  const document = editor.document
  const selections = editor.selections
  const replaceRanges = []

  editor.edit(edit => {
    for (var i = 0, len = selections.length; i < len; ++i) {
      const sel = selections[i]
      const txt = document.getText(new Range(sel.start, sel.end))
      const newTxt = String(fn(txt))
      if (txt === newTxt) {
        replaceRanges.push(sel)
      } else {
        edit.replace(sel, newTxt)
        const startPos = new Position(sel.start.line, sel.start.character)
        const endPos = new Position(
          sel.start.line + newTxt.split(/\r\n|\r|\n/).length - 1,
          sel.start.character + newTxt.length
        )
        replaceRanges.push(new Selection(startPos, endPos))
      }
    }
  })

  editor.selections = replaceRanges
}

function loopNumbers (fn) {
  loopSelections(txt => {
    const num = parseInt(txt, 10)
    return isNaN(num) ? txt : fn(num)
  })
}

function increment () {
  loopNumbers(num => num + 1)
}

function decrement () {
  loopNumbers(num => num - 1)
}

function incrementBy10 () {
  loopNumbers(num => num + 10)
}

function decrementBy10 () {
  loopNumbers(num => num - 10)
}
