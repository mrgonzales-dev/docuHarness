/**
 * Preload bridge between the renderer and the main process.
 *
 * Runs before the Vue app loads. Exposes a safe `window.api` object
 * so the renderer can call IPC channels without direct access to
 * Electron internals.
 *
 * Exposed methods:
 *   - chat(message, model, folderPath)   Send a chat request to the AI.
 *   - onThinking(callback)               Subscribe to live thinking updates.
 *   - onToolCall(callback)               Subscribe to live tool call updates.
 *   - getModels()                        Get the list of available AI models.
 *   - selectFolder()                     Open the folder picker dialog.
 *   - readFolderContents(path)           Read the contents of a folder.
 *
 * onThinking and onToolCall return an unsubscribe function. Call it
 * to stop listening when the chat ends.
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  chat: (message, model, folderPath) =>
    ipcRenderer.invoke("chat", {
      message,
      model,
      folderPath,
    }),
  onThinking: (callback) => {
    const listener = (_e, data) => callback(data);
    ipcRenderer.on("chat:thinking", listener);
    return () => ipcRenderer.removeListener("chat:thinking", listener);
  },
  onToolCall: (callback) => {
    const listener = (_e, data) => callback(data);
    ipcRenderer.on("chat:tool", listener);
    return () => ipcRenderer.removeListener("chat:tool", listener);
  },
  getModels: () => ipcRenderer.invoke("get-models"),
  selectFolder: () => ipcRenderer.invoke("dialog:openFolder"),
  readFolderContents: (path) => ipcRenderer.invoke("folder:readContents", path),
  interruptChat: () => ipcRenderer.invoke("chat:interrupt"),
});
