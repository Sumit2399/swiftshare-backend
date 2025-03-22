const express = require("express");
const { containerClient } = require("../config/azureConfig");

const router = express.Router();

router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const blobName = `${sessionId}.json`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadResponse = await blockBlobClient.download();

    let jsonData = "";
    for await (const chunk of downloadResponse.readableStreamBody) {
      jsonData += chunk.toString();
    }

    const data = JSON.parse(jsonData);

    // If an image exists, get its URL
    if (data.image) {
      const imageBlobClient = containerClient.getBlockBlobClient(data.image);
      data.imageUrl = imageBlobClient.url;
    }

    res.json(data);
  } catch (error) {
    console.error("Retrieve Error:", error);
    res.status(404).json({ error: "Session not found" });
  }
});

module.exports = router;
