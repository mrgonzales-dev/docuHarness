const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  chat: (message) => ipcRenderer.invoke("chat", message),
  getColors: () => ipcRenderer.invoke("get-colors"),
});
