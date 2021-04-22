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
let faults = [] 

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

app.post('/location', async (req, res) => {
  console.log(req.body);
  latlng = req.body.latlng
  res.send({ message: "ok"});
});

app.post('/insertFault', async (req, res) => {
  console.log(req.body);
  faults.push(req.body)
  res.send({ message: "ok"});
});

app.post('/deleteFault', async (req, res) => {

  console.log(req.body)
  res.send({ message: "ok"});
});





module.exports = app;