require("dotenv").config();
const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = "swiftsharecontent";
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Ensure container exists
async function createContainerIfNotExists() {
  const exists = await containerClient.exists();
  if (!exists) await containerClient.create();
}
createContainerIfNotExists();

// Upload text and image
async function uploadContent(text, image) {
  const sessionId = uuidv4();
  const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Expires in 24 hours

  // Upload text to Blob Storage
  const textBlob = containerClient.getBlockBlobClient(`${sessionId}.txt`);
  await textBlob.upload(text || "", text.length);

  // Upload image if present
  if (image) {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const imageBlob = containerClient.getBlockBlobClient(`${sessionId}.png`);
    await imageBlob.uploadData(buffer);
  }

  return { sessionId, expirationTime };
}

// Retrieve content
async function getContent(sessionId) {
  const textBlob = containerClient.getBlockBlobClient(`${sessionId}.txt`);
  const textExists = await textBlob.exists();
  let text = "";
  if (textExists) {
    const downloadBlockBlobResponse = await textBlob.downloadToBuffer();
    text = downloadBlockBlobResponse.toString();
  }

  const imageBlob = containerClient.getBlockBlobClient(`${sessionId}.png`);
  const imageExists = await imageBlob.exists();
  const imageUrl = imageExists ? imageBlob.url : null;

  if (!text && !imageUrl) return null;
  return { text, imageUrl };
}

module.exports = { uploadContent, getContent };
