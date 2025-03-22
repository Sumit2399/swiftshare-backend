const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const uploadRoutes = require("./routes/uploadRoutes");
const retrieveRoutes = require("./routes/retrieveRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/upload", uploadRoutes);
app.use("/api/retrieve", retrieveRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
