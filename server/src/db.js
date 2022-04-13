'use strict'
require('dotenv').config();
const util = require('./util.js') ;

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
    updateTrail: (body) => {
        let latlng = body.latlng;
        let lock = body.lock;
        let bearing = body.bearing;
        let rate = body.rate;
        let velocity = body.velocity;
        let timestamp = util.parseDate(body.timestamp);
    
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
                return resolve(result);
            });
        });
    },

    resetInspection: () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM defects;"
            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                return resolve(result);
            });
        });
    },

    prevPosition: () => {
        const sql = "SELECT ST_AsGeoJSON(geom) as geojson FROM trail ORDER BY ts DESC LIMIT 1";
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                return resolve(result);
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
            "WHERE geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ") ORDER BY ts DESC LIMIT 25;"
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

    insertInspection: (inspection, row) => {
        let data = [];
        let sql = null;
        data.push(util.parseInteger(row.id)); 
        data.push(util.parseInteger(inspection)); 
        data.push(util.parseString(row.type)); 
        data.push(util.parseString(row.color)); 
        data.push(util.parseString(row.fault)); 
        data.push(util.parseString(row.code)); 
        data.push(util.parseDate(row.gpstime)); 
        data.push(util.parseNumeric(row.altitude)); 
        data.push(util.parseBoolean(row.fill)); 
        data.push(util.parseString(row.fillColor)); 
        data.push(util.parseNumeric(row.opacity)); 
        data.push(util.parseNumeric(row.fillOpacity)); 
        data.push(util.parseInteger(row.radius)); 
        data.push(util.parseInteger(row.weight)); 
        if (row.type === 'point') {
            let lnglat = util.swapLatLng(row.latlng);
            sql = `INSERT INTO public.defects(
                id, inspection, type, color, fault, code, gpstime, altitude, fill, fillcolor, opacity, fillopacity, radius, weight, geom)
                VALUES (${data}, ST_SetSRID(ST_MakePoint(${lnglat}), 4326));` 
        } else if (row.type === 'line') {
            let wkt = util.arrayToWkt(row.latlng);
            sql = `INSERT INTO public.defects(
                id, inspection, type, color, fault, code, gpstime, altitude, fill, fillcolor, opacity, fillopacity, radius, weight, geom)
                VALUES (${data}, ST_GeomFromText(${wkt}));` 
        } else {
            throw new Error; 
        }
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                let row = resolve(result);
                return row;
            });
        });
    },

    inspection: (bounds, center) => {
        let sql = null;
        if (bounds) {
            let minx = bounds._southWest.lng;
            let miny = bounds._southWest.lat;
            let maxx = bounds._northEast.lng;
            let maxy = bounds._northEast.lat;
            let lat = center[0];
            let lng = center[1];
            sql = "SELECT id, inspection, type, color, fault, gpstime, fill, fillcolor, " +
            "opacity, fillopacity, radius, weight, ST_AsGeoJSON(geom) as geojson, ST_Distance(geom, ST_SetSRID(ST_MakePoint("
            + lng + "," + lat + "),4326)) AS dist FROM defects WHERE geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ")"
            + "ORDER BY geom <-> ST_SetSRID(ST_MakePoint(" + lng + "," + lat + "),4326);"
        } else {
            sql = "SELECT id, inspection, type, color, fault, gpstime, fill, fillcolor, " +
            "opacity, fillopacity, radius, weight, ST_AsGeoJSON(geom) as geojson FROM defects;" 
        }
         return new Promise((resolve, reject) => {
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
