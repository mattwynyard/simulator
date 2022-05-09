import { Polygon } from 'react-leaflet';
import DefectCircle from './DefectCircle.js';
import { useLeafletContext } from '@react-leaflet/core';
import { buildSquare, buildTriangle, buildStar } from './Shapes.js';
import { useMemo } from 'react';
import { DefectPopup } from '../DefectPopup.js'

export const getPointRadius = (zoom) => {
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

const LeafletTriangleDefect = (props) => {
    const map = useLeafletContext().map;
    const center = map.latLngToContainerPoint(props.data.geojson);
    const zoom = map.getZoom();
    const radius = useMemo(() => getPointRadius(zoom), [zoom]);
    //const points = useMemo(() => buildTriangle(center, props.rotation, radius * 1.41), [center, props.rotation, radius]);
    const points = buildTriangle(center, props.rotation, radius * 1.41);
    const latlngs = [];
    points.forEach((point) => {
        const latlng = map.containerPointToLatLng(point)
        latlngs.push(latlng)
    })
    return (
        <Polygon 
            positions={latlngs}
            stroke={props.data.stroke}
            fill={props.data.fill}
            color={props.data.color}
            opacity={props.data.opacity}
            fillColor={props.data.fillColor}
            fillOpacity={props.data.fillOpacity}
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
    const center = map.latLngToContainerPoint(props.data.geojson);
    const zoom = map.getZoom();
    const radius = useMemo(() => getPointRadius(zoom), [zoom]);
    const points = buildStar(center, radius * 1.41, 5);
    const latlngs = [];
    points.forEach((point) => {
        const latlng = map.containerPointToLatLng(point)
        latlngs.push(latlng)
    })
    return (
        <Polygon 
            positions={latlngs}
            stroke={props.data.stroke}
            fill={props.data.fill}
            color={props.data.color}
            opacity={props.data.opacity}
            fillColor={props.data.fillColor}
            fillOpacity={props.data.fillOpacity}
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
    const center = map.latLngToContainerPoint(props.data.geojson);
    const points = buildSquare(center, props.rotation, props.radius * 2);
    const latlngs = [];
    points.forEach((point) => {
        const latlng = map.containerPointToLatLng(point)
        latlngs.push(latlng)
    })
    return (
        <Polygon 
            positions={latlngs}
            stroke={props.data.stroke}
            fill={props.data.fill}
            color={props.data.color}
            opacity={props.data.opacity}
            fillColor={props.data.fillColor}
            fillOpacity={props.data.fillOpacity}
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
    const radius = useMemo(() => getPointRadius(zoom), [zoom]);

    if (props.data.shape === 'square') { //STC
        return (
            <LeafletSquareDefect data={props.data} rotation={0} radius={radius}/>
        );
    } else if (props.data.shape === 'circle') { //SUF
        return (
            <DefectCircle data={props.data} radius={radius}/>
        );
    } else if (props.data.shape === 'triangle') { //DRA
        return (
            <LeafletTriangleDefect data={props.data} rotation={30}/>
        );
    } else if (props.data.shape === 'star') { //SGN
        return (
            <LeafletStarDefect data={props.data}/>
        );
    } else if (props.data.shape === 'diamond') { //MSC
        return (
            <LeafletSquareDefect data={props.data} rotation={40}/>
        );
    } else {
        return (
            <DefectCircle data={props.data} radius={radius}/>
        );
    }
       
}