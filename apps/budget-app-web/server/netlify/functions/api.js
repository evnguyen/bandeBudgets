const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
// require("dotenv").config({ path: "./config.env" });
const serverless = require("serverless-http");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(require("../../routes/api"));

app.use(express.static("public"));

app.listen(port, () => {
  // perform a database connection when server starts
  // dbo.connectToServer(function (err) {
  //   if (err) console.error(err);
  //  });
  console.log(`Server is running on port: ${port}`);
});
module.exports = app;
module.exports.handler = serverless(app);
