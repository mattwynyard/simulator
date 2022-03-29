'use strict';
const express = require('express');
const app = express();
const http = require('http');
//const server = require('http').createServer(app);
const server = http.createServer(app);
const { Server } = require("socket.io");

const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./db.js');
const port = process.env.PROXY_PORT;
const host = process.env.PROXY;

let latlng = null;
let points = [];
let lines = [];
let pointMap = new Map();
let lineMap = new Map();

const refreshDataStore = (map) => {
  let f = [];
  map.forEach((value) => {
    f.push(value);
  });
  return f;
}

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

server.listen(port, () => {
  console.log(`Listening: http://${host}:${port}`);
});

// app.listen(port, () => {
//   console.log(`Listening: http://${host}:${port}`);
// });
 
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

io.on('connection', (socket) => {
  console.log("client connected");
  socket.emit("api", "ack")
});

//serve tiles
app.get('/tiles/:z/:x/:y', async (req, res) => {
  res.sendFile(path.join(__dirname, '../', req.url));
});

/**
 * incoming location from access
 */
 app.post('/location', async (req, res) => {
  latlng = req.body.latlng
  console.log( req.body.latlng);
  io.emit("latlng", req.body.latlng[0]);
  res.send({ message: "ok"});
  
});


app.get('/position', async (req, res) => {
  res.send({ latlng: latlng});
});

app.post('/centrelines', async (req, res) => {
  let result = await db.centrelines(req.body.bounds, req.body.center);
  res.send({data: result.rows})
});

app.post('/closestCentreline', async (req, res) => {
  let result = await db.closestCentreline(req.body.center);
  res.send({data: result.rows})
});

app.get('/fault', async (req, res) => {
  //res.send({ points: faults});
});

app.get('/reset', async (req, res) => {
  try {
    pointMap = new Map();
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

app.post('/insertPoint', async (req, res) => {
  pointMap.set(req.body.id, req.body);
  points.push(req.body);
  res.send({ message: "ok"});
});

app.post('/insertLine', async (req, res) => {
  lineMap.set(req.body.id, req.body);
  lines.push(req.body);
  res.send({ message: "ok"});
});

app.post('/appendLine', async (req, res) => {
  let line = lineMap.get(req.body.id);
  line.latlng.push(req.body.latlng[0])
  res.send({ message: "ok"});
});

app.post('/updateLine', async (req, res) => {
  console.log(req.body);
  if (lineMap.has(req.body.id)) {
    lineMap.delete(req.body.id);
    lineMap.set(req.body.id, req.body);
    lines = refreshDataStore(lineMap);
    res.send({ message: "updated"});
  } else {
    res.send({ message: "not updated"});
  }
});

app.post('/deleteLine', async (req, res) => {
  console.log(req.body);
  if (lineMap.has(req.body.id)) {
    lineMap.delete(req.body.id);
    lines = refreshDataStore(lineMap);
    console.log("deleted:" + req.body.id)
    res.send({ message: "deleted"});
  } else {
    console.log("notfound:" + req.body.id)
    res.send({ message: "id " + req.body.id + "not found"});
  }
});

app.post('/updatePoint', async (req, res) => {
  if (pointMap.has(req.body.id)) {
    pointMap.delete(req.body.id);
    pointMap.set(req.body.id, req.body);
    points = refreshDataStore(pointMap);
    res.send({ message: "updated"});
  } else {
    res.send({ message: "id not found"});
  } 
});

app.post('/deletePoint', async (req, res) => {
  console.log(req.body);
  if (pointMap.has(req.body.id)) {
    pointMap.delete(req.body.id);
    points = refreshDataStore(pointMap);
    console.log("deleted:" + req.body.id)
    res.send({ message: "deleted"});
  } else {
    console.log("notfound:" + req.body.id)
    res.send({ message: "id not found"});
  }
});

module.exports = app;