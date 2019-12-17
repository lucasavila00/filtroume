const express = require("express");
const path = require("path");
var https = require("https");
var fs = require("fs");
var cors = require("cors");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const viewsDir = path.join(__dirname, "public");
// app.use(express.static(viewsDir));
// app.use(
//   express.static(path.join(__dirname, "./weights")),
// );
app.use(express.static(path.join(__dirname, "./opencv")));
app.use(express.static(path.join(__dirname, "./weights")));
app.use(express.static(path.join(__dirname, "./luts")));
// app.use(express.static(path.join(__dirname, "./dist")));
// app.use(express.static(path.join(__dirname, "./build")));

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
