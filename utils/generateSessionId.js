const { v4: uuidv4 } = require("uuid");

const generateSessionId = () => uuidv4();

module.exports = { generateSessionId };
