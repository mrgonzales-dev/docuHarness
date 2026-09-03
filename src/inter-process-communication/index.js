/**
 * IPC handler registry.
 * Imports all handler modules and registers them with ipcMain.
 * Call registerIpcHandlers() once during app startup.
 */
const { ipcMain } = require("electron");
const chat = require("./chat");
const models = require("./models");
const dialog = require("./dialog");
const folder = require("./folder");

const handlers = [chat, models, dialog, folder];

function registerIpcHandlers() {
  for (const { name, handler } of handlers) {
    ipcMain.handle(name, handler);
  }
}

module.exports = { registerIpcHandlers };
