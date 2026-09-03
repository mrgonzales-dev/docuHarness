const fs = require("fs");
const axios = require("axios");

/**
 * Read a local file and return its content as text.
 * @param {string} filePath - The path to the file to read.
 * @returns {string} The file content.
 */
function readFile(filePath) {
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

module.exports = { readFile, writeDiff, webFetch };
