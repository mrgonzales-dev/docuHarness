const { app, BrowserWindow, ipcMain } = require("electron");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { loadConfig, getModels } = require("./src/config");
const { chat } = require("./src/ai-client-bridge");

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
  await checkApi();
  createWindow();
});

ipcMain.handle("get-colors", () => {
  const colorsPath = path.join(__dirname, "config", "colorscheme.json");
  const raw = fs.readFileSync(colorsPath, "utf-8");
  return JSON.parse(raw).colors;
});

ipcMain.handle("get-models", async () => {
  try {
    const models = await getModels();
    return { ok: true, models };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle("chat", async (event, { message, model }) => {
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are a documentation assistant. You help users find and read documentation.",
      },
      { role: "user", content: message },
    ];

    const reply = await chat(messages, model);
    return { ok: true, reply };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
