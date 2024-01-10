const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
// require("dotenv").config({ path: "./config.env" });
const serverless = require("serverless-http");
const port = process.env.PORT || 5000;

// Middleware
// app.use(cors());
app.use(express.json());

// Routes
app.use(require("../../routes/api"));

// Server public
app.use(express.static("public"));

// app.listen(port, () => {
//   console.log(`Server is running on port: ${port}`);
// });
// module.exports = app;

module.exports.handler = serverless(app);
