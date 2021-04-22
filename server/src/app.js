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
let faults = [];
let faultMap = new Map();

const refreshFaults = () => {
  let f = [];
  faultMap.forEach(function(value, key) {
    f.push(value);
  });
  faults = f;
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

app.get('/position', async (req, res) => {
  res.send({ latlng: latlng, faults: faults});
});

app.get('/fault', async (req, res) => {
  res.send({ faults: faults});
});

app.post('/reset', async (req, res) => {
  faultMap = new Map();
  faults = [];
  res.send({ message: "ok"});
});

app.post('/location', async (req, res) => {
  console.log(req.body);
  latlng = req.body.latlng
  res.send({ message: "ok"});
});

app.post('/insertPoint', async (req, res) => {
  console.log(req.body);
  faultMap.set(req.body.id, req.body);
  faults.push(req.body);
  res.send({ message: "ok"});
});

app.post('/insertLine', async (req, res) => {
  console.log(req.body);
  //faultMap.set(req.body.id, req.body);
  //faults.push(req.body);
  res.send({ message: "ok"});
});

app.post('/updatePoint', async (req, res) => {
  console.log(req.body);
  if (faultMap.has(req.body.id)) {
    faultMap.delete(req.body.id);
    faultMap.set(req.body.id, req.body);
    refreshFaults();
    res.send({ message: "updated"});
  } else {
    res.send({ message: "not updated"});
  } 
});

app.post('/deletePoint', async (req, res) => {
  console.log(req.body);
  if (faultMap.has(req.body.id)) {
    faultMap.delete(req.body.id);
    refreshFaults();
    res.send({ message: "deleted"});
  } else {
    res.send({ message: "not deleted"});
  }
});

module.exports = app;