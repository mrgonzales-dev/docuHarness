const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  chat: (message, model, folderPath) =>
    ipcRenderer.invoke("chat", {
      message,
      model,
      folderPath,
    }),
  getModels: () => ipcRenderer.invoke("get-models"),
  selectFolder: () => ipcRenderer.invoke("dialog:openFolder"),
  readFolderContents: (path) => ipcRenderer.invoke("folder:readContents", path),
});
