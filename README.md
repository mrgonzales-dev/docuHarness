# DocuHarness

AI harness for documentation. Reads docs, fetches web pages, shows changes in diff format. Does not write code.

## Prerequisites

- Node.js v18+
- npm

## Setup

```bash
npm install
node node_modules/electron/install.js
```

## Configuration

Create `config/api_key.json`:

```json
{
  "host": "http://127.0.0.1:20128/v1",
  "key": "your-api-key"
}
```

## Run

Development mode with hot reload:

```bash
./dev.sh
```

Or manually:

```bash
npm run dev    # Start Vite dev server
npm start      # Launch Electron (separate terminal)
```

Production mode:

```bash
npm run build
npm run start:prod
```

## Project Structure

```
docuHarness/
  main.js              # Electron main process
  src/
    config.js          # API config and model loader
    preload.js         # IPC bridge
    tools.js           # Documentation tools
    renderer/
      App.vue          # Vue UI
      main.js          # Vue mount
      style.css        # Styles
      index.html       # Entry HTML
  config/
    colorscheme.json   # GitHub Dark theme
  test/
    test-config.js     # API connection test
  vite.config.js       # Vite config
  dev.sh               # Dev launcher script
```
