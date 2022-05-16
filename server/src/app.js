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
const util = require('./util.js') ;
const { Console } = require('console');
const MIN_DISTANCE = 3;

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
      if (lockjson) {
        newRow.lock = [lockjson.coordinates[1], lockjson.coordinates[0]];
      } else {
        newRow.lock = [geojson.coordinates[1], geojson.coordinates[0]];
      }    
      data.push(newRow)
    })
    io.emit("trail", data);
  });

  socket.on("refresh", async () => {
    console.log("refesh")
  });

  socket.on("styles", async () => {
    try {
      let styles = await db.faultStyles();
      let data = [];
      styles.rows.forEach(element => {
        data.push({'code': element.code, 'styles': {'fault': element.description, 'repair': element.repair, 'class': element.class,
      'color': element.color, 'fill': element.fill, 'fillcolor': element.fillcolor, 'fillopacity': element.fillopacity, 'opacity': element.opacity,
      'shape': element.shape}})
      });
      io.emit("styles", data);
    } catch (error) {
      console.log(error)
    }
  });

  socket.on("geometry", async (bounds) => {
    let cls = null;
    let faults = null;
    let signs = null;
    try {
      //cls = await db.centrelinesIndex(bounds, center);
      cls = await db.centrelineStatus(bounds);
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
    } catch (error) {
      console.log(error)
    }
    try {
      faults = await db.selectInspectionMap(bounds, 'fault');
      signs = await db.selectInspectionMap(bounds, 'sign');
      if (faults.rowCount > 0 || signs.rowCount > 0) {
        let points = [];
        let lines = [];
        let signPoints = [];
        faults.rows.forEach(row => {
          if (row.type === 'point') {
            //row.radius = util.getPointRadius(zoom);
            let pointLngLat = JSON.parse(row.geojson).coordinates;
            let pointLatLng = [pointLngLat[1], pointLngLat[0]];
            row.geojson = pointLatLng;
            points.push(row);
          } else if (row.type === 'line') {
            let line = JSON.parse(row.geojson).coordinates;
            let newLine = [];
            line.forEach((point) => {
              let coords = [];
              coords.push(point[1]);
              coords.push(point[0]);
              newLine.push(coords);
            });
            row.geojson = newLine;
            lines.push(row)
          }   
        });
        signs.rows.forEach(row => {
          let pointLngLat = JSON.parse(row.geojson).coordinates;
          let pointLatLng = [pointLngLat[1], pointLngLat[0]];
          row.geojson = pointLatLng;
          signPoints.push(row);
        });
        io.emit("geometry", {centreline: cls.rows, inspection: {points: points, lines: lines, signs: signPoints}});
      } else {
        io.emit("geometry", {centreline: cls.rows, inspection: null});
      }
    } catch (error) {
      console.log(error)
    }
    
  });
  socket.on("inspection", async (bounds, center) => {
    try {
      let ins = await db.inspection(bounds, center);
      //console.log(ins.rowCount)
      let points = [];
      let lines = [];
      if (ins.rowCount > 0) {
        ins.rows.forEach(row => {
          if (row.type === 'point') {
            let pointLngLat = JSON.parse(row.geojson).coordinates;
            let pointLatLng = [pointLngLat[1], pointLngLat[0]];
            row.geojson = pointLatLng;
            points.push(row);
          } else if (row.type === 'line') {
            let line = JSON.parse(row.geojson).coordinates;
            let newLine = [];
            line.forEach((point) => {
              let coords = [];
              coords.push(point[1]);
              coords.push(point[0]);
              newLine.push(coords);
            });
            row.geojson = newLine;
            lines.push(row)
          }        
        });
      }   
      io.emit("geometry", {inspection: {points: points, lines: lines}});
    } catch (error) {
      console.log(error)
    }
  });

}); //connection

//serve tiles
app.get('/tiles/:z/:x/:y', async (req, res) => {
  res.sendFile(path.join(__dirname, '../', req.url));
});

app.post('/start', (req, res) => {
  io.emit("simulator", "start")
  res.send({ message: "ok"});
  
});

app.post('/stop', (req, res) => {
  io.emit("simulator", "stop")
  res.send({ message: "ok"});
});
/**
 * incoming location from access
 */
 app.post('/location', async (req, res) => {
   
   let arr = req.body.timestamp.split('.');
   if (arr[1] === "000") {
    try {
      const prev = await db.prevPosition();
      if (req.body.lock.length === 0) {
        req.body.lock = [...req.body.latlng]
      }
      if (prev.rowCount > 0) {
        const point1 = JSON.parse(prev.rows[0].geojson).coordinates;
        const point2 = [req.body.latlng[1], req.body.latlng[0]];
        const d = util.haversine(point1, point2);
        if (d >= MIN_DISTANCE) {
          await db.updateTrail(req.body);
          io.emit("latlng", req.body);
        }    
      } else {
        await db.updateTrail(req.body);
        io.emit("latlng", req.body);
      }   
    } catch (err) {
      console.log(err)
    }
   } else {
    io.emit("latlng", req.body);
   }  
  res.send({ message: "ok"}); 
});

app.post('/centrelines', async (req, res) => {
  //let centre = await db.centrelines(req.body.bounds, req.body.center);
  res.send({data: centre.rows})
});

app.post('/centerlineStatus', async (req, res) => {
  let count = 0;
  let errors = 0;
  console.log(req.body)
  for (let i = 0; i < req.body.data.length; i++) {
    try {
      let result = await db.updateCentrelineStatus(req.body.data[i].id, req.body.data[i].status);
      count += 1;
    } catch (error) {
      console.log(error);
        errors++;
    }
  }
  res.send({data: "ok"})
});

app.post('/status', async (req, res) => {
  let count = 0;
  let errors = 0;
  console.log(req.body.status)
  const done = req.body.status.done;
  const live = req.body.status.live;
  const next = req.body.status.done;
  const part = req.body.status.part;
  if (done) {
    try {
      let result = await db.updateCentrelineStatus(done, 'done');
      count++;
    } catch (error) {
      console.log(error)
      error++;
    }
  }
  if (live) {
    try {
      let result = await db.updateCentrelineStatus(live, 'live');
      count++;
    } catch (error) {
      console.log(error);
      error++;
    }
  }
  if (next) {
    try {
        let result = await db.updateCentrelineStatus(next, 'next');
        count++;
    } catch (error) {
      console.log(error);
      error++;
    }
  }
  if (part) {
    try {
      let result = await db.updateCentrelineStatus(done, 'part');
      count++;
    } catch (error) {
      console.log(error);
      error++;
    }  
  }
  io.emit("status", {updated: count, error: errors});
  res.send({data: "ok"})
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
  console.log(req.body)
  res.send({ message: "ok"});
});

app.post('/insertLine', async (req, res) => {
  console.log(req.body)
  res.send({ message: "ok"});
});

app.post('/updateLine', async (req, res) => {
  console.log(req.body)
    res.send({ message: "updated"});
});

app.post('/deleteLine', async (req, res) => {
  console.log(req.body)
    res.send({ message: "deleted"});
});

app.post('/updatePoint', async (req, res) => {
  console.log(req.body)
    res.send({ message: "updated"});
});

app.post('/deletePoint', async (req, res) => {
  console.log(req.body)
    res.send({ message: "deleted"});
});

module.exports = app;