const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  chat: (message, model) => ipcRenderer.invoke("chat", { message, model }),
  getModels: () => ipcRenderer.invoke("get-models"),
});
