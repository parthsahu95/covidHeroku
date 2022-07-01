const path = require("path");
const fs = require("fs");
const express = require("express");
// var ParseHub = require("parsehub");
// var api = new ParseHub(process.env.API_KEY);
require("dotenv").config({ path: "./.env" });
var request = require("request");

const app = express();
const port = process.env.PORT;
const storageFile = path.join(__dirname, "store.json");

var cors = require("cors");
app.use(cors());
app.use(express.static(path.join(__dirname, "/public")));

function updateStorageData() {
  request(
    {
      uri: `https://parsehub.com/api/v2/projects/${process.env.PROJECT_TOKEN}/last_ready_run/data`,
      method: "GET",
      gzip: true,
      qs: {
        api_key: process.env.API_KEY,
        format: "json",
      },
    },
    function (err, resp, body) {
      let jsonData = JSON.parse(body);
      fs.writeFile(storageFile, JSON.stringify(jsonData), (err) => {
        console.log(err);
      });
    }
  );
}

function readDataFromFile(cb) {
  fs.readFile(storageFile, (err, fileContent) => {
    if (err) {
      cb(err);
    } else if (fileContent.length) {
      return cb(JSON.parse(fileContent));
    }
  });
}

app.get("/data", (req, res) => {
  console.log("Request run");
  readDataFromFile((data) => {
    res.send(data);
  });
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

setInterval(updateStorageData, 60000);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
