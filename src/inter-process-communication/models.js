/**
 * IPC handler for model list requests.
 * Fetches all available models from the API and returns them as an array.
 *
 * @returns {Promise<{ok: boolean, models?: string[], error?: string}>}
 */
const { getModels } = require("../config");

module.exports = {
  name: "get-models",
  handler: async () => {
    try {
      const models = await getModels();
      return { ok: true, models };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },
};
