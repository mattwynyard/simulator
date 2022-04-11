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

function parseDate(d) {
    if (!d.indexOf('-') && d.indexOf('\/')) {
        let index = s.indexOf('\ ');
        let date = d.substring(0, index);
        let time = d.substring(index, d.length);
    } else {
        return "'" + d + "'";
    }
}

module.exports = { 
    updateTrail: (body) => {
        let latlng = body.latlng;
        let lock = body.lock;
        let bearing = body.bearing;
        let rate = body.rate;
        let velocity = body.velocity;
        let timestamp = parseDate(body.timestamp);
        let sql = `INSERT INTO trail(ts, bearing, velocity, rate, geom, lock) VALUES (` + `${timestamp}, ${bearing}, ${velocity}, ${rate}, ST_MakePoint(${latlng[1]}, ${latlng[0]}), ST_MakePoint(${lock[1]}, ${lock[0]}));`
        return new Promise((resolve, reject) => {           
            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                let ok = resolve(result);
                return ok;
            });
        });
    },

    resetTrail: () => {
        return new Promise((resolve, reject) => {
            let sql = "DELETE FROM trail;"
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

    trail: (bounds) => {
        let minx = bounds._southWest.lng;
        let miny = bounds._southWest.lat;
        let maxx = bounds._northEast.lng;
        let maxy = bounds._northEast.lat;
        return new Promise((resolve, reject) => {
            let sql = "SELECT ts, bearing, velocity, rate, ST_AsGeoJSON(geom) as geojson, ST_AsGeoJSON(lock) as lockjson FROM trail " +
            "WHERE geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ") ORDER BY ts ASC;"
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

    centrelines: (bounds, center) => {
        let minx = bounds._southWest.lng;
        let miny = bounds._southWest.lat;
        let maxx = bounds._northEast.lng;
        let maxy = bounds._northEast.lat;
        let lat = center[0];
        let lng = center[1];
  
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
    closestCentreline: (center) => {
        console.log(center);
        let lat = center[0].lat;
        let lng = center[0].lng;
        return new Promise((resolve, reject) => {
            let sql = "SELECT cwid, roadid, label, ST_AsGeoJSON(geom) as geojson, ST_Distance(geom, ST_SetSRID(ST_MakePoint("
             + lng + "," + lat + "),4326)) AS dist FROM centreline ORDER BY geom <-> ST_SetSRID(ST_MakePoint(" + lng + "," + lat + "),4326) LIMIT 1";
            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                let line = resolve(result);
                return line;
            });
        });
    }


}
