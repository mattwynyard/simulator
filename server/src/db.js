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
        let sql = null;
        if (lock.length === 0) {
            sql = `INSERT INTO trail(ts, bearing, velocity, rate, geom) VALUES (` + `${timestamp}, ${bearing}, ${velocity}, ${rate}, ST_MakePoint(${latlng[1]}, ${latlng[0]}));`
        } else {
            sql = `INSERT INTO trail(ts, bearing, velocity, rate, geom, lock) VALUES (` + `${timestamp}, ${bearing}, ${velocity}, ${rate}, ST_MakePoint(${latlng[1]}, ${latlng[0]}), ST_MakePoint(${lock[1]}, ${lock[0]}));`
        }
        
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

    // insertFaultPoint: (data) => {

    //     const sql = `INSERT INTO public.defects(${data.id}, inspection, type, code, repair, priority, side, starterp, enderp, length, width, count, ` +
    //     ` photo, signcode, inspector, gpstime, geom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    //      return new Promise((resolve, reject) => {
    //         connection.query(sql, (err, result) => {
    //             if (err) {
    //                 console.error('Error executing query', err.stack)
    //                 return reject(err);
    //             }
    //             let carriage = resolve(result);
    //             return carriage;
    //         });
    //     });
    // },

    insertDefect: (inspection, defect) => {
        let data = [];
        let sql = null;
        data.push(util.parseInteger(defect.id)); 
        data.push(util.parseInteger(inspection)); 
        data.push(util.parseString(defect.type));  
        data.push(util.parseString(defect.fault)); 
        data.push(util.parseString(defect.repair)); 
        data.push(util.parseInteger(defect.priority));
        data.push(util.parseString(defect.side));
        data.push(util.parseInteger(defect.erp));
        data.push(util.parseInteger(defect.finerp));
        data.push(util.parseInteger(defect.length));
        data.push(util.parseNumeric(defect.width));
        data.push(util.parseInteger(defect.count));  
        data.push(util.parseString(defect.photoname));
        data.push(util.parseString(defect.signcode));
        data.push(util.parseString(defect.inspector));
        data.push(util.parseDate(defect.gpstime)); 
        if (defect.type === 'fault') {
            let lng = defect.geojson[1];
            let lnglat = [lng, defect.geojson[0]]
            sql = `INSERT INTO public.defects(
                id, inspection, type, code, repair, priority, side, starterp, enderp, length, width, count, photo, signcode, inspector, gpstime, geom)
                VALUES (${data}, ST_SetSRID(ST_MakePoint(${lnglat}), 4326));`; 
        } else if (defect.type === 'line') {
            let wkt = util.arrayToWkt(data.latlng);
            sql = `INSERT INTO public.defects(
                id, inspection, type, code, repair, priority, side, starterp, enderp, length, width, count, photo, inspector, gpstime, geom)
                VALUES (${data}, ST_SetSRID(ST_GeomFromText(${wkt}), 4326));`;
        } else if (defect.type === 'sign') {
            let lng = defect.geojson[1];
            let lnglat = [lng, defect.geojson[0]]
            sql = `INSERT INTO public.defects(
                id, inspection, type, code, repair, priority, side, starterp, enderp, length, width, count, photo, signcode, inspector, gpstime, geom)
                VALUES (${data}, ST_SetSRID(ST_MakePoint(${lnglat}), 4326));`; 
        } else {
            throw new Error; 
        }
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                let _result = resolve(result);
                return _result;
            });
        });
    },

    selectInspectionMap: (bounds, type) => {
        let sql = null;
        if (bounds) {
            let minx = bounds._southWest.lng;
            let miny = bounds._southWest.lat;
            let maxx = bounds._northEast.lng;
            let maxy = bounds._northEast.lat;
            if (type === 'fault') {
                sql = "SELECT d.id, d.inspection, d.code, d.type, m.shape, m.description, d.repair, d.priority, d.side, d.starterp, d.enderp, " +
                "d.length, d.width, d.count, d.photo, d.inspector, d.gpstime, m.class, ST_AsGeoJSON(d.geom) as geojson FROM defects as d,  " +
                " dfmap as m WHERE geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ") AND d.code = m.code AND m.class !='SGN'"
            } else if (type === 'sign') {
                sql = "SELECT d.id, d.inspection, d.code, d.type, m.shape, m.description, d.repair, d.priority, d.side, d.starterp, d.enderp, " +
                "d.count, d.photo, s.description, d.inspector, d.gpstime, m.class, ST_AsGeoJSON(d.geom) as geojson FROM defects as d, dfmap as m, " +
                " sgmap as s WHERE geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ") AND d.code = m.code AND d.signcode = s.code AND m.class ='SGN'"; 
            }         
        } else {
            sql = "SELECT d.id, d.inspection, d.code, d.type, m.shape, m.description, d.repair, d.priority, d.side, d.starterp, d.enderp, " +
            "d.length, d.width, d.count, d.photo, d.inspector, d.gpstime, m.class, ST_AsGeoJSON(d.geom) as geojson FROM defects as d, dfmap " +
            " as m WHERE d.code = m.code";
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

    selectInspection: (bounds) => {
        let sql = null;
        if (bounds) {
            let minx = bounds._southWest.lng;
            let miny = bounds._southWest.lat;
            let maxx = bounds._northEast.lng;
            let maxy = bounds._northEast.lat;
            sql = "SELECT d.id, d.code, d.inspection, d.type, d.repair, d.priority, d.side, d.starterp, d.enderp, d.length, d.width, " +
            " d.count, d.photo, d.inspector, d.gpstime, ST_AsGeoJSON(d.geom) as geojson FROM defects as d WHERE geom && " +
            "ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ");"
        } else {
            sql = "SELECT id, inspection, type, code, repair, priority, side, starterp, enderp, length, width, " +
            " count, photo, inspector, gpstime, ST_AsGeoJSON(geom) as geojson FROM defects;"
        }
         return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack)
                    return reject(err);
                }
                let _result = resolve(result);
                return _result;
            });
        });
    },

    inspectionIndex: (bounds) => {
        let sql = null;
        if (bounds) {
            let minx = bounds._southWest.lng;
            let miny = bounds._southWest.lat;
            let maxx = bounds._northEast.lng;
            let maxy = bounds._northEast.lat;
            sql = "SELECT id, inspection, type, code, gpstime, " +
            "ST_AsGeoJSON(geom) as geojson FROM defects WHERE geom && " +
            "ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ");"
        } else {
            sql = "SELECT id, inspection, type, code, gpstime, " +
            "ST_AsGeoJSON(geom) as geojson FROM defects;" 
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



    centrelineStatus: (bounds) => {
        let minx = bounds._southWest.lng;
        let miny = bounds._southWest.lat;
        let maxx = bounds._northEast.lng;
        let maxy = bounds._northEast.lat;
        let sql = "SELECT c.cwid, c.roadid, c.label, ST_AsGeoJSON(c.geom) as geojson, c.status, m.color, m.opacity, m.weight FROM centreline as c"
        + " INNER JOIN clmap as m ON c.status = m.status WHERE m.status != 'initial' AND geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ");"
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

    updateCentrelineStatus: (id, status) => {
        const _status = util.parseString(status.toLowerCase());
        const _id = util.parseString(util.parseInteger(id).toString());
        let sql = `UPDATE centreline SET status = ${_status} WHERE cwid = ${_id};`
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

    closestCentreline: (center) => {
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
