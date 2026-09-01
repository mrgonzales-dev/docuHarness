const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../config/", "api_key.json");

function loadConfig() {
  const raw = fs.readFileSync(configPath, "utf-8");
  const data = JSON.parse(raw);
  return {
    host: data.host,
    apiKey: data.key,
  };
}

module.exports = { loadConfig };
