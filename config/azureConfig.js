const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = "swiftsharecontent"; // Your Azure Blob container name
const containerClient = blobServiceClient.getContainerClient(containerName);

module.exports = { containerClient };
