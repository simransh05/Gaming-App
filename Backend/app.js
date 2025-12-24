const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookie = require('cookie-parser');
const port = process.env.PORT || 4000;
const app = express();

app.use(cors({
  origin: process.env.BASE_URL,
  methods: ['POST', 'GET', 'DELETE', 'PUT'],
  credentials: true
}));
app.use(cookie())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./routes/route'))

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.BASE_URL,
    credentials: true,
  },
});

require("./socket/socket")(io);

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    server.listen(port, () => {
      console.log(`Server started on port 4000`);
    });
  })
