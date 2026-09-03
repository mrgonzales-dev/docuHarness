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
  getModels: () => ipcRenderer.invoke("get-models"),
  selectFolder: () => ipcRenderer.invoke("dialog:openFolder"),
  readFolderContents: (path) => ipcRenderer.invoke("folder:readContents", path),
});
