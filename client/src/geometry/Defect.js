import { Polygon, useMap } from 'react-leaflet';
import DefectCircle from './DefectCircle.js';
import { useLeafletContext } from '@react-leaflet/core';
import { buildSquare, buildTriangle, buildStar, buildCross } from './Shapes.js';
import { useMemo } from 'react';
import { DefectPopup } from '../DefectPopup.js';

export const getPointRadius = (zoom) => {
    switch (zoom) {
        case 18:
            return 9;
        case 17:
            return 8;
        case 16:
            return 7;
        case 15:
            return 6;
        case 14:
            return 4;
        case 13:
            return 3;
        default:
            return 3;
    }
}

const getColor = (priority) => {
    if (priority === 1) {
        return "#EE00EE";
    } else if (priority === 2) {
        return "#DD7500";	 
    } else if (priority === 3) {
        return "#00CD00";
    } else {
        return "#000000";
    }
}

export const LeafletTriangleDefect = (props) => {
    const map = useMap();
    const points = buildTriangle(props.center, props.rotation, props.radius * 1.41);
    const latlngs = [];
    points.forEach((point) => {
        const latlng = map.containerPointToLatLng(point)
        latlngs.push(latlng)
    })
    return (
        <Polygon 
            positions={latlngs}
            pathOptions={{color: "#000000"}}
            stroke={true}
            weight={1}
            opacity={1.0}
            fillColor={props.color}
            fillOpacity={1.0}
            eventHandlers={{
                mouseover: (e) => {
                    e.target.openPopup();
                },
                mouseout: (e) => {
                    e.target.closePopup();
                }
            }}
        >
            <DefectPopup data ={props.data}/>
        </Polygon>
    );
}

const LeafletCrossDefect = (props) => {
    const map = useLeafletContext().map;
    const points = buildCross(props.center, 0, props.radius);
    const latlngs = [];
    points.forEach((point) => {
        const latlng = map.containerPointToLatLng(point)
        latlngs.push(latlng)
    })
    return (
        <Polygon 
        positions={latlngs}
        pathOptions={{color: "#000000"}}
        stroke={true}
        weight={1}
        opacity={1}
        fillColor={props.color}
        fillOpacity={1.0}
            eventHandlers={{
                mouseover: (e) => {
                    e.target.openPopup();
                },
                mouseout: (e) => {
                    e.target.closePopup();
                }
            }}
        >
            <DefectPopup data ={props.data}/>
        </Polygon>
    );
}

const LeafletStarDefect = (props) => {
    const map = useLeafletContext().map;
    const points = buildStar(props.center, props.radius * 1.41);
    const latlngs = [];
    points.forEach((point) => {
        const latlng = map.containerPointToLatLng(point)
        latlngs.push(latlng)
    })
    return (
        <Polygon 
            positions={latlngs}
            pathOptions={{color: "#000000"}}
            stroke={true}
            weight={2}
            opacity={1}
            fillColor={props.color}
            fillOpacity={1.0}
            eventHandlers={{
                mouseover: (e) => {
                    e.target.openPopup();
                },
                mouseout: (e) => {
                    e.target.closePopup();
                }
            }}
        >
            <DefectPopup data ={props.data}/>
        </Polygon>
    );
}

const LeafletSquareDefect = (props) => {
    const map = useLeafletContext().map;
    const points = buildSquare(props.center, props.rotation, props.radius * 2);
    const latlngs = [];
    points.forEach((point) => {
        const latlng = map.containerPointToLatLng(point)
        latlngs.push(latlng)
    })
    return (
        <Polygon 
            positions={latlngs}
            pathOptions={{color: "#000000"}}
            stroke={true}
            weight={1}
            opacity={1.0}
            fillColor={props.color}
            fillOpacity={1.0}
            eventHandlers={{
                mouseover: (e) => {
                    e.target.openPopup();
                },
                mouseout: (e) => {
                    e.target.closePopup();
                }
            }}
        >
            <DefectPopup data ={props.data}/>
        </Polygon>
    );
}

export default function Defect(props) {
    const map = useLeafletContext().map;
    const zoom = map.getZoom();
    const center = map.latLngToContainerPoint(props.data.geojson);
    const radius = useMemo(() => getPointRadius( zoom), [zoom]);
    const color = useMemo(() => getColor(props.data.priority))

    if (props.data.shape === 'square') { //STC
        return (
            <LeafletSquareDefect data={props.data} rotation={0} radius={radius} center={center} color={color}/>
        );
    } else if (props.data.shape === 'star') { //SUF
        return (
            <LeafletStarDefect data={props.data} radius={radius} center={center} color={color}/>
        );
    } else if (props.data.shape === 'triangle') { //DRA
        return (
            <LeafletTriangleDefect data={props.data} rotation={30} radius={radius} center={center} color={color}/>
        );
    } else if (props.data.shape === 'circle') { //SGN
        return (
            <DefectCircle data={props.data} radius={radius} center={center} color={color}/>    
        );
    } else if (props.data.shape === 'cross') { //FTP
        return (
            <LeafletCrossDefect data={props.data} radius={radius} center={center} color={color}/>    
        );
    } else if (props.data.shape === 'diamond') { //MSC
        return (
            <LeafletSquareDefect data={props.data} rotation={40} radius={radius} center={center} color={color}/>
        );
    } else { //find symbol?
        return (
            <DefectCircle data={props.data} radius={radius} color={color}/>
            // <ReactLeafletSquare data={props.data} size={radius}/>
        );
    }
       
}