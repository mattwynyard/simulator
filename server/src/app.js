'use strict';
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db.js');
const port = process.env.PROXY_PORT;
const host = process.env.PROXY;

let latlng = null;
let points = [];
let lines = [];
let faultMap = new Map();
let lineMap = new Map();

const refreshDataStore = (map, arr) => {
  let f = [];
  map.forEach((value) => {
    f.push(value);
  });
  arr = f;
}

app.listen(port, () => {
  console.log(`Listening: http://${host}:${port}`);
});
 
app.use(cors());
app.use(morgan('dev'));
//app.use(helmet());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.json({limit: '500mb', extended: false}));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: false }))
// Parse JSON bodies (as sent by API clients)
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

//serve tiles
app.get('/tiles/:z/:x/:y', async (req, res) => {
  res.sendFile(path.join(__dirname, '../', req.url));
});

app.get('/position', async (req, res) => {
  res.send({ latlng: latlng, points: points, lines, lines});
});

app.post('/centrelines', async (req, res) => {
  let result = await db.centrelines(req.body.bounds, req.body.center);
  res.send({data: result.rows})
});

app.get('/fault', async (req, res) => {
  //res.send({ points: faults});
});

app.get('/reset', async (req, res) => {
  try {
    faultMap = new Map();
    lineMap = new Map();
    points = [];
    lines = [];
    latlng = null;
    res.send("reset");
  } catch(error) {
    console.log(error)
    res.send("error");
  }
});

app.post('/location', async (req, res) => {
  latlng = req.body.latlng
  res.send({ message: "ok"});
});

app.post('/insertPoint', async (req, res) => {
  console.log(req.body);
  faultMap.set(req.body.id, req.body);
  points.push(req.body);
  res.send({ message: "ok"});
});

app.post('/insertLine', async (req, res) => {
  console.log(req.body);
  lineMap.set(req.body.id, req.body);
  lines.push(req.body);
  res.send({ message: "ok"});
});

app.post('/appendLine', async (req, res) => {
  //console.log(req.body);
  let line = lineMap.get(req.body.id);
  line.latlng.push(req.body.latlng[0])
  console.log(line.latlng);
  res.send({ message: "ok"});
});

app.post('/updateLine', async (req, res) => {
  console.log(req.body);
  if (lineMap.has(req.body.id)) {
    lineMap.delete(req.body.id);
    lineMap.set(req.body.id, req.body);
    refreshDataStore(lineMap, lines);
    res.send({ message: "updated"});
  } else {
    res.send({ message: "not updated"});
  }
});

app.post('/deleteLine', async (req, res) => {
  console.log(req.body);
  if (lineMap.has(req.body.id)) {
    lineMap.delete(req.body.id);
    refreshDataStore(lineMap, lines);
    res.send({ message: "deleted"});
  } else {
    res.send({ message: "id not found"});
  }
});

app.post('/updatePoint', async (req, res) => {
  console.log(req.body);
  if (faultMap.has(req.body.id)) {
    faultMap.delete(req.body.id);
    faultMap.set(req.body.id, req.body);
    refreshDataStore(faultMap, points);
    res.send({ message: "updated"});
  } else {
    res.send({ message: "id not found"});
  } 
});

app.post('/deletePoint', async (req, res) => {
  console.log(req.body);
  if (faultMap.has(req.body.id)) {
    faultMap.delete(req.body.id);
    refreshDataStore(faultMap, points);
    res.send({ message: "deleted"});
  } else {
    res.send({ message: "id not found"});
  }
});

module.exports = app;