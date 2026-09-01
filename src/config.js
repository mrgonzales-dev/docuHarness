const fs = require("fs");
const path = require("path");
const axios = require("axios");

const configPath = path.join(__dirname, "../config/", "api_key.json");

function loadConfig() {
  const raw = fs.readFileSync(configPath, "utf-8");
  const data = JSON.parse(raw);
  return {
    host: data.host,
    apiKey: data.key,
  };
}

async function getModels() {
  const { host, apiKey } = loadConfig();
  const res = await axios.get(`${host}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const models = res.data.data.map((m) => m.id);
  return models;
}

module.exports = { loadConfig, getModels };
