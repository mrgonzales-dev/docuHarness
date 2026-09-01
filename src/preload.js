const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  chat: (message, model) => ipcRenderer.invoke("chat", { message, model }),
  getColors: () => ipcRenderer.invoke("get-colors"),
  getModels: () => ipcRenderer.invoke("get-models"),
});
