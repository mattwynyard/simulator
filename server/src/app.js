'use strict';
const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);
const { Server } = require("socket.io");

const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./db.js');
const port = process.env.PROXY_PORT;
const host = process.env.PROXY;

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
 
app.use(cors());
app.use(morgan('dev'));
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

io.on('connection',(socket) => {
  console.log("client connected on socket");
  socket.on("trail", async (bounds) => {
    let trail = await db.trail(bounds);
    let data = []
    trail.rows.forEach(row => {
      let newRow = {};
      newRow.timestamp = row.ts;
      newRow.bearing = row.bearing;
      newRow.velocity = row.velocity;
      let geojson = JSON.parse(row.geojson);
      newRow.latlng = [geojson.coordinates[1], geojson.coordinates[0]];
      let lockjson = JSON.parse(row.lockjson);
      newRow.lock = [lockjson.coordinates[1], lockjson.coordinates[0]];
      data.push(newRow)
    })
    io.emit("trail", data);
  });
  socket.on("centrelines", async (bounds, center) => {
    let data = await db.centrelines(bounds, center);
    //console.log(lines);
    data.rows.forEach(row => {
      let line = JSON.parse(row.geojson).coordinates;
      let newLine = [];
      line[0].forEach((point) => {
        let coords = [];
        coords.push(point[1]);
        coords.push(point[0]);
        newLine.push(coords);
      });
      row.geojson = newLine;
    });
    io.emit("centrelines", data.rows);
    data = null;
  });
});

//serve tiles
app.get('/tiles/:z/:x/:y', async (req, res) => {
  res.sendFile(path.join(__dirname, '../', req.url));
});

app.get('/initialise', async (req, res) => {
  res.send({ points: points, lines, lines});
});

/**
 * incoming location from access
 */
 app.post('/location', async (req, res) => {
   let arr = req.body.timestamp.split('.');
   if (arr[1] === "000") {
    try {
      await db.updateTrail(req.body);
    } catch (err) {
      console.log(err)
    }
   }
  io.emit("latlng", req.body);
  res.send({ message: "ok"}); 
});

app.post('/centrelines', async (req, res) => {
  let centre = await db.centrelines(req.body.bounds, req.body.center);
  res.send({data: centre.rows})
});

app.post('/inspection', async (req, res) => {
  io.emit("inspection", req.body);
  res.send({result: "ok"})
});

app.get('/reset', async (req, res) => {
  try {
    pointMap = new Map();
    lineMap = new Map();
    points = [];
    lines = [];
    io.emit("reset", { points: [], lines: []})
    res.send("reset");
  } catch(error) {
    console.log(error)
    io.emit("error", error)
    res.send("error");
  }
});

app.post('/insertPoint', async (req, res) => {
  io.emit("insertPoint", req.body);
  pointMap.set(req.body.id, req.body);
  res.send({ message: "ok"});
});

app.post('/insertLine', async (req, res) => {
  lineMap.set(req.body.id, req.body);
  io.emit("insertLine", req.body);
  res.send({ message: "ok"});
});

app.post('/updateLine', async (req, res) => {
  if (lineMap.has(req.body.id)) {
    lineMap.delete(req.body.id);
    lineMap.set(req.body.id, req.body);
    lines = refreshDataStore(lineMap);
    io.emit("updateLine", lines);
    res.send({ message: "updated"});
  } else {
    res.send({ message: "not updated"});
  }
});

app.post('/deleteLine', async (req, res) => {
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