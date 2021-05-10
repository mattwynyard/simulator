'use strict'
require('dotenv').config();

const { Client } = require('pg');

const connection = new Client({
    user: process.env.USER_NAME,
    host: process.env.HOST,
    database: process.env.DB,
    password: process.env.PASSWORD,
    port: process.env.PORT,
    max: 20,
    connectionTimeoutMillis: 10000,
});

try {
    connection.connect();
} catch (err) {
    console.log(err);
}
connection.on('connect', () => {
    console.log("connected to database on port: " + process.env.PORT);
});

connection.on('error', error => {
    console.log(error);
    throw err;
});

module.exports = { 
    centrelines: (bounds, center) => {
        let minx = bounds._southWest.lng;
        let miny = bounds._southWest.lat;
        let maxx = bounds._northEast.lng;
        let maxy = bounds._northEast.lat;
        let lat = center.lat;
        let lng = center.lng;
  
        return new Promise((resolve, reject) => {
            let sql = "SELECT cwid, roadid, label, ST_AsGeoJSON(geom) as geojson, ST_Distance(geom, ST_SetSRID(ST_MakePoint("
             + lng + "," + lat + "),4326)) AS dist FROM centreline WHERE geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ")"
             + "ORDER BY geom <-> ST_SetSRID(ST_MakePoint(" + lng + "," + lat + "),4326);" 
            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                let carriage = resolve(result);
                return carriage;
            });
        });
    },


}
