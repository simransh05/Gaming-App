const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start Server
app.listen(4000, () => {
  console.log(`Server started on port 4000`);
});