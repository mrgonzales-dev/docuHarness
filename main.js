const { app, BrowserWindow } = require("electron");
const axios = require("axios");
const path = require("path");
const { loadConfig } = require("./src/config");
const { registerIpcHandlers } = require("./src/inter-process-communication");

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

const isDev = process.env.NODE_ENV === "development";

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

  if (isDev) {
    win.loadURL("http://127.0.0.1:3000");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

app.on("ready", async () => {
  registerIpcHandlers();
  await checkApi();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
