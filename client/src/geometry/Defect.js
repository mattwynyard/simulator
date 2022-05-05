import { Polygon, Popup } from 'react-leaflet';
import DefectCircle from './DefectCircle.js';
import { useLeafletContext } from '@react-leaflet/core';
import {buildSquare, buildTriangle } from './Shapes.js';
import { useMemo } from 'react';

export function getPointRadius(zoom) {
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
    const radius = getPointRadius(map.getZoom());
    const points = useMemo(() => buildTriangle(center, props.rotation, radius * 1.41), [center, props.rotation, radius]);
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
        >
            <Popup
                className = {"popup"}
                autoPan={false}
                closeOnClick={true}
            >
                <div>
                    {`id: ${props.data.id}`}<br></br>
                    {`inspection: ${props.data.inspection}`}<br></br>
                    {`code: ${props.data.code}`}<br></br>
                    {`fault: ${props.data.description}`}<br></br>
                    {`priority: ${props.data.priority}`}<br></br>
                    {`repair: ${props.data.repair}`}<br></br>
                    {`side: ${props.data.side}`}<br></br>
                    {`start: ${props.data.starterp} m`}<br></br>
                    {`end: ${props.data.enderp} m`}<br></br>
                    {`length: ${props.data.length} m`}<br></br>
                    {`width: ${props.data.width} m`}<br></br>
                    {`count: ${props.data.count}`}<br></br>
                    {`inspector: ${props.data.inspector}`}<br></br>
                    {`photo: ${props.data.photo}`}<br></br>
                    {`timestamp: ${props.data.gpstime}`}<br></br>
                    {`lat: ${props.data.geojson[0]}`}<br></br> 
                    {`lng: ${props.data.geojson[1]}`}<br></br> 
                </div> 
            </Popup>
        </Polygon>
    );
}

const LeafletSquareDefect = (props) => {
    const map = useLeafletContext().map;
    const center = map.latLngToContainerPoint(props.data.geojson);
    const radius = getPointRadius(map.getZoom());
    const points = useMemo(() => buildSquare(center, props.rotation, radius * 2), [center, props.rotation, radius]);
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
        >
            <Popup
                className = {"popup"}
                autoPan={false}
                closeOnClick={true}
            >
                <div>
                    {`id: ${props.data.id}`}<br></br>
                    {`inspection: ${props.data.inspection}`}<br></br>
                    {`code: ${props.data.code}`}<br></br>
                    {`fault: ${props.data.description}`}<br></br>
                    {`priority: ${props.data.priority}`}<br></br>
                    {`repair: ${props.data.repair}`}<br></br>
                    {`side: ${props.data.side}`}<br></br>
                    {`start: ${props.data.starterp} m`}<br></br>
                    {`end: ${props.data.enderp} m`}<br></br>
                    {`length: ${props.data.length} m`}<br></br>
                    {`width: ${props.data.width} m`}<br></br>
                    {`count: ${props.data.count}`}<br></br>
                    {`inspector: ${props.data.inspector}`}<br></br>
                    {`photo: ${props.data.photo}`}<br></br>
                    {`timestamp: ${props.data.gpstime}`}<br></br>
                    {`lat: ${props.data.geojson[0]}`}<br></br> 
                    {`lng: ${props.data.geojson[1]}`}<br></br> 
                </div> 
            </Popup>
        </Polygon>
    );
}

export default function Defect(props) {
    if (props.data.shape === 'square') { //STC
        return (
            <LeafletSquareDefect data={props.data} rotation={0} sides={4}/>
        );
    // } else if (props.data.shape === 'circle') { //SUF
    //     return (
    //         <DefectCircle data={props.data}/>
    //     );
    } else if (props.data.shape === 'triangle') { //DRA
        return (
            <LeafletTriangleDefect data={props.data} rotation={30} sides={3}/>
        );
    } else if (props.data.shape === 'diamond') { //SGN
        return (
            <LeafletSquareDefect data={props.data} rotation={40} sides={4}/>
        );
    } else {
        return (
            // <DefectCircle data={props.data}/>
            null
        );
    }
       
}