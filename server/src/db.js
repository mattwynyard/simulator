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

    insertInspection: (inspection, row) => {
        let data = [];
        let sql = null;
        data.push(util.parseInteger(row.id)); 
        data.push(util.parseInteger(inspection)); 
        data.push(util.parseString(row.type));  
        data.push(util.parseString(row.fault)); 
        data.push(util.parseString(row.repair)); 
        data.push(util.parseInteger(row.priority));
        data.push(util.parseString(row.side));
        data.push(util.parseInteger(row.erp));
        data.push(util.parseInteger(row.finerp));
        data.push(util.parseInteger(row.length));
        data.push(util.parseNumeric(row.width));
        data.push(util.parseInteger(row.count));  
        data.push(util.parseString(row.photoname));
        data.push(util.parseString(row.inspector));
        data.push(util.parseDate(row.gpstime)); 
        if (row.type === 'point') {
            let lng = row.geojson[1];
            let lnglat = [lng, row.geojson[0]]
            sql = `INSERT INTO public.defects(
                id, inspection, type, code, repair, priority, side, starterp, enderp, length, width, count, photo, inspector, gpstime, geom)
                VALUES (${data}, ST_SetSRID(ST_MakePoint(${lnglat}), 4326));` 
        } else if (row.type === 'line') {
            let wkt = util.arrayToWkt(row.latlng);
            sql = `INSERT INTO public.defects(
                id, inspection, type, code, repair, priority, side, starterp, enderp, length, width, count, photo, inspector, gpstime, geom)
                VALUES (${data}, ST_SetSRID(ST_GeomFromText(${wkt}), 4326));` 
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

    faultStyles: () => {
        let sql = "SELECT code, description, repair, class, color, fill, fillcolor, opacity, fillopacity, shape" + 
            " FROM public.dfmap;"
        
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

    // inspection: (bounds, center) => {
    //     let sql = null;
    //     if (bounds) {
    //         let minx = bounds._southWest.lng;
    //         let miny = bounds._southWest.lat;
    //         let maxx = bounds._northEast.lng;
    //         let maxy = bounds._northEast.lat;
    //         let lat = center[0];
    //         let lng = center[1];
    //         sql = "SELECT id, inspection, type, color, fault, gpstime, fill, fillcolor, " +
    //         "opacity, fillopacity, radius, weight, ST_AsGeoJSON(geom) as geojson, ST_Distance(geom, ST_SetSRID(ST_MakePoint("
    //         + lng + "," + lat + "),4326)) AS dist FROM defects WHERE geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ")"
    //         + "ORDER BY geom <-> ST_SetSRID(ST_MakePoint(" + lng + "," + lat + "),4326);"
    //     } else {
    //         sql = "SELECT id, inspection, type, color, fault, gpstime, fill, fillcolor, " +
    //         "opacity, fillopacity, radius, weight, ST_AsGeoJSON(geom) as geojson FROM defects;" 
    //     }
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

    centrelines: (bounds, center) => {
        let minx = bounds._southWest.lng;
        let miny = bounds._southWest.lat;
        let maxx = bounds._northEast.lng;
        let maxy = bounds._northEast.lat;
        let lat = center[0];
        let lng = center[1];
        let sql = "SELECT cwid, roadid, label, ST_AsGeoJSON(geom) as geojson, ST_Distance(geom, ST_SetSRID(ST_MakePoint("
        + lng + "," + lat + "),4326)) AS dist FROM centreline WHERE geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ")"
        + "ORDER BY geom <-> ST_SetSRID(ST_MakePoint(" + lng + "," + lat + "),4326);" 
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

    centrelinesIndex: (bounds, center) => {
        let minx = bounds._southWest.lng;
        let miny = bounds._southWest.lat;
        let maxx = bounds._northEast.lng;
        let maxy = bounds._northEast.lat;
        let sql = "SELECT cwid, roadid, label, ST_AsGeoJSON(geom) as geojson FROM centreline "
        + "WHERE geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ");"
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
        let sql = "SELECT c.cwid, c.roadid, c.label, ST_AsGeoJSON(c.geom) as geojson, c.status, m.color, m.opacity, m.weight FROM centreline as c, "
        + "clmap as m WHERE c.status = m.status and geom && ST_MakeEnvelope( " + minx + "," + miny + "," + maxx + "," + maxy + ");"
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
