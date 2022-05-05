const EARTH_RADIUS = 6371000; //metres

function getPointRadius(zoom) {
    switch (zoom) {
        case 18:
            return 6;
        case 17:
            return 5;
        case 16:
            return 4;
        case 15:
            return 3;
        case 14:
            return 2;
        case 13:
            return 1;
        default:
            return 6;
    }
}

function buildQuery(arr) {
    let query = ""; 
    for (var i = 0; i < arr.length; i += 1) {
        if (i < arr.length - 1) {
            query += ("'" + arr[i] + "'" + ",");
        } else {
            query += "'" + arr[i] + "'";
        }
    }
    return query;
}

function haversine(point1, point2) {
    
    let x1 = point2[1] - point1[1]; //lat index 1
    let dLat = radians(x1);
    let x2 = point2[0] - point1[0]; //lng index 0
    let dLon = radians(x2);
    let a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
        Math.cos(radians(point1[1])) * Math.cos(radians(point2[1])) * 
         Math.sin(dLon/2) * Math.sin(dLon/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return EARTH_RADIUS * c;
}

function radians(n) {
    return n * (Math.PI / 180)
}

function parseInteger(x) {
    let n = parseInt(x)
    if (Number.isNaN(n)) {
        return 'NULL';
    } else {
        return n;
    }
}

function parseNumeric(x) {
    let n = parseFloat(x)
    if (Number.isNaN(n)) {
        return 'NULL';
    } else {
        return n;
    }
}

function parseString(s) { 
    if (!s) return 'NULL';
    if (s.indexOf('\'') >= 0) {
        let index = s.indexOf('\'');
        let str = s.substring(0, index) + s.substring(index + 1, s.length);
        return parseString(str);
    } else {
        return "'" + s + "'";
    }
}

function parseDate(d) {
    if (!d.indexOf('-') && d.indexOf('\/')) {
        let index = s.indexOf('\ ');
        let date = d.substring(0, index);
        let time = d.substring(index, d.length);
    } else {
        return "'" + d + "'";
    }
}

function parseBoolean(b) {
    if (b === 'true') {
        return true;
    } else {
        return false;
    }
}

function swapLatLng(point) {
    return [point[1], point[0]];
}

function arrayToWkt(arr) {
    let wkt = `'LINESTRING ( `
    for (let i = 0; i < arr.length; i++) {
        let lat = arr[i][0];
        let lng = arr[i][1];
        if (i == arr.length - 1) {
            wkt += lng.toString() + " " + lat.toString() + ")'";
        } else {
            wkt += lng.toString() + " " + lat.toString() + ", ";
        }
    }
    console.log(wkt);
    return wkt;
}

module.exports = {getPointRadius, buildQuery, parseInteger, parseDate, parseString, parseNumeric, 
    swapLatLng, arrayToWkt, parseBoolean, haversine}