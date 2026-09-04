const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { FileFinder } = require("@ff-labs/fff-node");

let finder = null;

const skillsDir = path.join(__dirname, "default_skills");

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
 * List available skills or invoke a specific skill by name.
 * When no skillName is given, returns a list of skills with descriptions.
 * When skillName is given, returns the full skill markdown content.
 * @param {Object} args - The arguments.
 * @param {string} [args.skillName] - The name of the skill to invoke.
 * @returns {string} The skill list or skill content.
 */
function invokeSkill({ skillName } = {}) {
  if (!fs.existsSync(skillsDir)) {
    return "Skills are empty";
  }

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const skillFolders = entries.filter((e) => e.isDirectory());

  if (skillFolders.length === 0) {
    return "Skills are empty";
  }

  if (!skillName) {
    const skills = [];
    for (const folder of skillFolders) {
      const skillFile = path.join(skillsDir, folder.name, "skill.md");
      if (!fs.existsSync(skillFile)) continue;

      const raw = fs.readFileSync(skillFile, "utf-8");
      const descMatch = raw.match(/^description:\s*(.+)$/m);
      const whenMatch = raw.match(/^when_to_use:\s*(.+)$/m);

      skills.push({
        name: folder.name,
        description: descMatch ? descMatch[1].trim() : "No description",
        when_to_use: whenMatch ? whenMatch[1].trim() : "No usage info",
      });
    }

    if (skills.length === 0) {
      return "Skills are empty";
    }

    return JSON.stringify(skills, null, 2);
  }

  const skillFile = path.join(skillsDir, skillName, "skill.md");
  if (!fs.existsSync(skillFile)) {
    return `Error: Skill "${skillName}" not found`;
  }

  return fs.readFileSync(skillFile, "utf-8");
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

/**
 * Check if the skills directory has any skill folders with skill.md files.
 * @returns {boolean} True if at least one skill is available.
 */
function hasSkills() {
  if (!fs.existsSync(skillsDir)) return false;
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  return entries.some((e) => e.isDirectory() && fs.existsSync(path.join(skillsDir, e.name, "skill.md")));
}

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

// Only include invokeSkill if skills are available
if (hasSkills()) {
  toolDefinitions.push({
    type: "function",
    function: {
      name: "invokeSkill",
      description: "List available skills with descriptions, or invoke a specific skill by name to get its full content. Call without skillName to see available skills. Call with skillName to get the skill's markdown content.",
      parameters: {
        type: "object",
        properties: {
          skillName: {
            type: "string",
            description: "The name of the skill to invoke. Omit to list all available skills.",
          },
        },
        required: [],
      },
    },
  });
}

// Map tool names to functions
const toolFunctions = {
  readFile,
  fileSearch,
  fileGrep,
  invokeSkill,
};

module.exports = {
  readFile,
  fileSearch,
  fileGrep,
  invokeSkill,
  writeDiff,
  webFetch,
  toolDefinitions,
  toolFunctions,
  hasSkills,
};
