import { Polygon, useMap } from 'react-leaflet';
import DefectCircle from './DefectCircle.jsx';
import { useLeafletContext } from '@react-leaflet/core';
import { buildSquare, buildTriangle, buildStar, buildCross } from './Shapes.jsx';
import { useMemo } from 'react';
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
            weight={props.weight}
            opacity={1.0}
            fillColor={props.color}
            fillOpacity={1.0}
            eventHandlers={{
                click: (e) => {
                    props.onClick(e, props.data)
                }
            }}
        >
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
        weight={props.weight}
        opacity={1}
        fillColor={props.color}
        fillOpacity={1.0}
            eventHandlers={{
                click : (e) => {
                    props.onClick(e, props.data)
                }
            }}
        >
        </Polygon>
    );
}

const LeafletStarDefect = (props) => {
    const map = useMap();
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
            weight={props.weight}
            opacity={1}
            fillColor={props.color}
            fillOpacity={1.0}
            eventHandlers={{
                click: (e) => {
                    props.onClick(e, props.data)
                }
            }}
        >
        </Polygon>
    );
}

const LeafletSquareDefect = (props) => {
    const map = useMap();
    const points = buildSquare(props.center, props.rotation, props.radius * 2);
    const latlngs = [];
    points.forEach((point) => {
        const latlng = map.containerPointToLatLng(point)
        latlngs.push(latlng)
    });
    return (
        <Polygon 
            positions={latlngs}
            pathOptions={{color: "#000000"}}
            stroke={true}
            weight={props.weight}
            opacity={1.0}
            lineCap={'square'}
            lineJoin={'square'}
            fillColor={props.color}
            fillOpacity={1.0}
            eventHandlers={{
                click: (e) => {
                    props.onClick(e, props.data)
                }
            }}
        >
        </Polygon>
    );
}

export function DefectPoint(props) {
    const map = useMap();
    const zoom = map.getZoom();
    const weight = useMemo(() => {
        console.log(zoom)
        if (zoom >= 18) {
            return 2;
        } else {
            return 1;
        }
    }, [zoom]);
    
    const center = map.latLngToContainerPoint(props.data.geojson);
    const radius = useMemo(() => getPointRadius(zoom), [zoom]);
    const color = useMemo(() => getColor(props.data.priority), [props.data.priority]);

    if (props.data.shape === 'square') { //STC
        return (
            <LeafletSquareDefect 
                data={props.data} 
                rotation={0} 
                radius={radius} 
                center={center} 
                color={color} 
                weight={weight} 
                onClick={props.onClick}
                />
        );
    } else if (props.data.shape === 'star') { //SUF
        return (
            <LeafletStarDefect 
                data={props.data} 
                radius={radius} 
                center={center} 
                color={color} 
                weight={weight}
                onClick={props.onClick}
                />
        );
    } else if (props.data.shape === 'triangle') { //DRA
        return (
            <LeafletTriangleDefect 
                data={props.data} 
                rotation={30} 
                radius={radius} 
                center={center} 
                color={color} 
                weight={weight}
                onClick={props.onClick}
                />
        );
    } else if (props.data.shape === 'circle') { //SGN
        return (
            <DefectCircle 
                data={props.data} 
                radius={radius} 
                center={center} 
                color={color} 
                weight={weight}
                onClick={props.onClick}
                />    
        );
    } else if (props.data.shape === 'cross') { //FTP
        return (
            <LeafletCrossDefect 
                data={props.data} 
                radius={radius} 
                center={center} 
                color={color} 
                weight={weight}
                onClick={props.onClick}
                />    
        );
    } else if (props.data.shape === 'diamond') { //MSC
        return (
            <LeafletSquareDefect 
                data={props.data} 
                rotation={40} 
                radius={radius} 
                center={center} 
                color={color} 
                weight={weight}
                onClick={props.onClick}
                />
        );
    } else { //find symbol?
        return (
            <DefectCircle 
                data={props.data} 
                radius={radius} 
                color={color} 
                weight={weight}
                onClick={props.onClick}
                />
        );
    }
       
}

export default function DefectPoints(props) {

    return (
        <>
        {props.data.map((defect) =>
            <DefectPoint
              data={defect}
              key={defect.id}
              id={defect.id}
              onClick={props.onClick}
            />
            )} 
        </>
    );

}