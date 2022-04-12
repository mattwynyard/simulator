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
  socket.on("geometry", async (bounds, center) => {
    let cls = await db.centrelines(bounds, center);
    let ins = await db.inspection(bounds, center);
    //console.log(lines);
    cls.rows.forEach(row => {
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
    io.emit("geometry", {centreline: cls.rows, inspection: ins.rows});
  });
  socket.on("inspection", async (bounds, center) => {
    let data = await db.inspection(bounds, center);
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

app.post('/start', async (res, req) => {
  console.log("start")
});

app.post('/stop', async (res, req) => {
  console.log("stop")
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
  let count = 0;
  let errors = 0;
  for (let i = 0; i < req.body.data.length; i++) {
    try {  
      let result = await db.insertInspection(req.body.inspection, req.body.data[i]);
      count += result.rowCount;
    } catch (error) {
        console.log(error);
        errors++;
    }
  }  
  io.emit("loaded", {inserted: count, error: errors});
  res.send({result: "ok"})
});

app.get('/reset', async (req, res) => {
  try {
    await db.resetTrail();
    await db.resetInspection();
    res.send("reset");
  } catch(error) {
    console.log(error)
    io.emit("error", error)
    res.send("error");
  }
});

app.post('/insertPoint', async (req, res) => {
  res.send({ message: "ok"});
});

app.post('/insertLine', async (req, res) => {
  res.send({ message: "ok"});
});

app.post('/updateLine', async (req, res) => {
    res.send({ message: "updated"});
});

app.post('/deleteLine', async (req, res) => {
    res.send({ message: "deleted"});
});

app.post('/updatePoint', async (req, res) => {
    res.send({ message: "updated"});
});

app.post('/deletePoint', async (req, res) => {
    res.send({ message: "deleted"});
});

module.exports = app;