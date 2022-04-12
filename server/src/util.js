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

module.exports = {buildQuery, parseInteger, parseDate, parseString, parseNumeric, swapLatLng, arrayToWkt, parseBoolean}