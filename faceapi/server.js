const express = require("express");
const path = require("path");
var https = require("https");
var fs = require("fs");
var cors = require("cors");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "./static")));

https
  .createServer(
    {
      key: fs.readFileSync("server.key"),
      cert: fs.readFileSync("server.cert"),
    },
    app,
  )
  .listen(3007, () =>
    console.log("Listening on port 3007!"),
  );
