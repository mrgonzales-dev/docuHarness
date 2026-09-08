/**
 * IPC handler registry.
 * Imports all handler modules and registers them with ipcMain.
 * Call registerIpcHandlers() once during app startup.
 */
const { ipcMain } = require("electron");
const agent = require("./agent");
const models = require("./models");
const dialog = require("./dialog");
const folder = require("./folder");

const handlers = [agent, models, dialog, folder];

function registerIpcHandlers() {
  for (const { name, handler } of handlers) {
    ipcMain.handle(name, handler);
  }
  ipcMain.handle("agent:interrupt", agent.interrupt);
}

module.exports = { registerIpcHandlers };
