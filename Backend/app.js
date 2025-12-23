const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookie = require('cookie-parser');
const port = process.env.PORT || 4000;
const app = express();

// Middlewares
app.use(cors({
  origin: process.env.BASE_URL,
  methods: ['POST', 'GET', 'DELETE', 'PUT'],
  credentials: true
}));
app.use(cookie())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.use('/', require('./routes/route'))

// Start Server
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started on port 4000`);
    });
  })
