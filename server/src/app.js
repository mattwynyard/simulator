'use strict';
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db.js');
const port = process.env.PROXY_PORT;
const host = process.env.PROXY;
const javaPort = process.env.JAVA_PORT;
const util = require('./util.js') ;
const MIN_DISTANCE = 3;
//const { connectController } = require('./clientSocket.js');
let javaSocket = null;

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

server.listen(port, () => {
  console.log(`Listening: http://${host}:${port}`);
  // try {
  //   javaSocket = connectController(javaPort);

  // } catch (err) {
  //   console.log(err)
  // }
});
 
app.use(cors());
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

// app.use(express.static(path.join(__dirname, 'build')));

// app.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

io.on('connection',(socket) => {
  console.log("client connected on socket");
  javaSocket.write("refresh")
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

  const fetchCentrelines = async (bounds) => {
    let cls = null;
    try {
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
      return cls.rows;
    } catch (error) {
      console.log(error);
      return [];
    }
   
  }

  const fetchInspection = async (bounds) => {
    let faults = null;
    let signs = null;
    try {
      faults = await db.selectInspectionMap(bounds, 'fault');
      signs = await db.selectInspectionMap(bounds, 'sign');
      if (faults.rowCount > 0 || signs.rowCount > 0) {
        let points = [];
        let lines = [];
        let signPoints = [];
        faults.rows.forEach(row => {
          if (row.type === 'fault') {
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
        return {points: points, lines: lines, signs: signPoints};
      } else {
        return {points: [], lines: [], signs: []};
      }      
    } catch (error) {
      console.log(error);
      return {points: [], lines: [], signs: []};
    }
  }

  socket.on("geometry", async (bounds, type) => {
    if (type === "both") {
      const cls = await fetchCentrelines(bounds);
      const ins = await fetchInspection(bounds);  
      io.emit("geometry", {centreline: cls, inspection: {points: ins.points, lines: ins.lines, signs: ins.signs}});    
    } else if (type === "inspection") {
      const ins = await fetchInspection(bounds); 
      
      io.emit("geometry", {inspection: {points: ins.points, lines: ins.lines, signs: ins.signs}});   
    } else if (type === "centreline") {
      const cls = await fetchCentrelines(bounds);
      io.emit("geometry", {centreline: cls});   
    } else {
      io.emit("geometry", {centreline: [], inspection: {points: [], lines: [], signs: []}});       
    } 
  });

}); //connection

/**
 * ACCESS ENDPOINTS
 */
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
  const done = req.body.status.done;
  const live = req.body.status.live;
  const next = req.body.status.next;
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
      let result = await db.updateCentrelineStatus(part, 'part');
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
      const result = await db.insertDefect(req.body.inspection, req.body.data[i]);
      count += result.rowCount;
    } catch (error) {
        console.log(error.detail);
        errors++;
    }
  }  
  io.emit("loaded", {inserted: count, error: errors});
  res.send({result: "ok"})
});

app.get('/reset', async (req, res) => {
  try {
    console.log(req.body)
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
  try {
    const result = await db.insertDefect(req.body.inspection, req.body.data);
    io.emit("insert", result.rowCount)
  } catch (err) {
    console.log(err)
  }
  
  res.send({ rows: result.rowCount});
});

app.post('/insertLine', async (req, res) => {
  //console.log(req.body)
  const result = await db.insertDefect(req.body.inspection, req.body.data);
  io.emit("insert", result.rowCount)
  res.send({ rows: result.rowCount});
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
  console.log(`Update: ${req.body}`)
  const result = await db.updateDefect(req.body.inspection, req.body.data);
  res.send({ message: "updated"});
});

app.post('/deletePoint', async (req, res) => {
  console.log(req.body)
  try {
    const result = await db.deleteDefect(req.body.id);
    io.emit("delete", result.rowCount)
  } catch (error) {
    console.log(error)
    res.send({rows: result.rowCount})
  }
  
});

module.exports = app;