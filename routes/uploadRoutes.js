const express = require("express");
const multer = require("multer");
const { containerClient } = require("../config/azureConfig");
const { generateSessionId } = require("../utils/generateSessionId");

const router = express.Router();
const upload = multer();

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { text, sessionId: providedSessionId } = req.body;
    
    // Use provided sessionId or generate a new one if not provided
    const sessionId = providedSessionId || generateSessionId();
    const blobName = `${sessionId}.json`;

    // Prepare the data to be stored
    const data = { text, expiration: Date.now() + 7 * 24 * 60 * 60 * 1000 };

    // Handle file upload if present
    if (req.file) {
      const imageBlobName = `${sessionId}-image.png`;
      const blockBlobClient = containerClient.getBlockBlobClient(imageBlobName);
      await blockBlobClient.uploadData(req.file.buffer, { overwrite: true });
      data.image = imageBlobName;
    }

    // Upload/update the JSON data
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(
      Buffer.from(JSON.stringify(data)), 
      { 
        overwrite: true,
        blobHTTPHeaders: { blobContentType: "application/json" } 
      }
    );

    res.json({ 
      sessionId, 
      expiration: new Date(data.expiration).toISOString() 
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Failed to upload data" });
  }
});

module.exports = router;
