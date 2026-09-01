const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require("axios");
const { loadConfig } = require("./src/config");

async function checkApi() {
  const { host, apiKey } = loadConfig();
  console.log("Checking API at:", host);
  console.log("API Key:", apiKey);
  try {
    const res = await axios.get(`${host}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const count = res.data.data ? res.data.data.length : 0;
    console.log("API check OK. Models available:", count);
  } catch (err) {
    console.log("API check error:", err.message);
  }
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: __dirname + "/src/preload.js",
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile("index.html");
}

app.on("ready", async () => {
  await checkApi();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
