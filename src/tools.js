const fs = require("fs");
const axios = require("axios");
const { FileFinder } = require("@ff-labs/fff-node");

let finder = null;

function fileSearch({ query, basePath }) {
  // kill that freaking finder first
  if (finder) finder.destroy();

  const result = FileFinder.create({ basePath, aiMode: true });
  if (!result.ok) throw new Error(result.error);

  finder = result.value;
  return finder.fileSearch(query, { pageSize: 20 });
}

function fileGrep({ query, basePath }) {
  //patay ka sakin
  if (finder) finder.destroy();

  const result = FileFinder.create({ basePath, aiMode: true });
  // may error ba? tanga dapat wala
  if (!result.ok) throw new Error(result.error);

  finder = result.value;
  const hits = finder.grep(query, {
    mode: "plain",
    smartCase: true,
    beforeContext: 1,
    afterContext: 1,
    classifyDefinitions: true,
  });
  return hits;
}

/**
 * Read a local file and return its content as text.
 * @param {string} filePath - The path to the file to read.
 * @returns {string} The file content.
 */
function readFile({ filePath }) {
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    throw new Error(`Path is a directory, not a file: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Format a list of changes as a unified diff string.
 * @param {Object} args - The diff arguments.
 * @param {string} args.file - The file name to show in the diff header.
 * @param {Array<{type: "add"|"remove"|"keep", text: string}>} args.changes - The list of changes.
 * @returns {string} The unified diff string.
 */
function writeDiff(args) {}

/**
 * Fetch a web page URL and return its text content with HTML stripped.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<string>} The page text content.
 */
async function webFetch(url) {}

/**
 * Remove HTML tags, scripts, and styles from an HTML string.
 * @param {string} html - The raw HTML string.
 * @returns {string} The cleaned text.
 */
function stripHtml(html) {}

// Tool definitions sent to the AI
const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "readFile",
      description: "Read a local file and return its content as text.",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "The path to the file to read.",
          },
        },
        required: ["filePath"],
      },
    },
  },

    {
      type: "function",
      function: {
        name: "fileSearch",
        description: "Search for files by name with fuzzy matching.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search query." },
            basePath: { type: "string", description: "The base directory to search." },
          },
          required: ["query", "basePath"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "fileGrep",
        description: "Search file contents for a pattern.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "The content search query." },
            basePath: { type: "string", description: "The base directory to search." },
          },
          required: ["query", "basePath"],
        },
      },
    },
];

// Map tool names to functions
const toolFunctions = {
  readFile,
  fileSearch,
  fileGrep
};

module.exports = {
  readFile,
  fileSearch,
  fileGrep,
  writeDiff,
  webFetch,
  toolDefinitions,
  toolFunctions,
};
