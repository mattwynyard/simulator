import { Polygon, useMap } from 'react-leaflet';
import DefectCircle from './DefectCircle.js';
import { useLeafletContext } from '@react-leaflet/core';
import { buildSquare, buildTriangle, buildStar, buildCross } from './Shapes.js';
import { useMemo, useState } from 'react';
import { DefectPopup } from '../DefectPopup.js';
import { DefectToast } from '../DefectToast.jsx';
import { getColor, getPointRadius } from '../Utilities/Geometry.js';


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
            weight={2}
            opacity={1.0}
            fillColor={props.color}
            fillOpacity={1.0}
            eventHandlers={{
                click: (e) => {
                    e.target.openPopup();
                }
            }}
        >
            {/* <DefectPopup data ={props.data}/> */}
            <DefectToast 
                data ={props.data} 
            />
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
        weight={2}
        opacity={1}
        fillColor={props.color}
        fillOpacity={1.0}
            eventHandlers={{
                click : (e) => {
                    e.target.openPopup();
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
                click: (e) => {
                    e.target.openPopup();
                }
            }}
        >
            <DefectPopup data ={props.data}/>
        </Polygon>
    );
}

const LeafletSquareDefect = (props) => {

    const [showToast, setShowToast] = useState(false);
    const map = useLeafletContext().map;
    const points = buildSquare(props.center, props.rotation, props.radius * 2);
    const latlngs = [];
    points.forEach((point) => {
        const latlng = map.containerPointToLatLng(point)
        latlngs.push(latlng)
    });

    const handleClick = (e) => {
        console.log("click")
        setShowToast(true)
    }
    return (
        <Polygon 
            positions={latlngs}
            pathOptions={{color: "#000000"}}
            stroke={true}
            weight={1}
            opacity={1.0}
            lineCap={'square'}
            lineJoin={'square'}
            fillColor={props.color}
            fillOpacity={1.0}
            eventHandlers={{
                click: (e) => {
                    handleClick(e);
                }
            }}
        >
            <DefectToast 
                show={true}
                data ={props.data} 
            />
        </Polygon>
    );
}

export default function DefectPoint(props) {
    const map = useLeafletContext().map;
    const zoom = map.getZoom();
    const center = map.latLngToContainerPoint(props.data.geojson);
    const radius = useMemo(() => getPointRadius( zoom), [zoom]);
    const color = useMemo(() => getColor(props.data.priority), [props.data.priority])

    if (props.data.shape === 'square') { //STC
        return (
            <LeafletSquareDefect data={props.data} rotation={0} radius={radius} center={center} color={color} click={props.onClick}/>
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