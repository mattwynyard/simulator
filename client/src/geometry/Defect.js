import { Polygon, Popup } from 'react-leaflet';
import DefectCircle from './DefectCircle.js';
import { useLeafletContext } from '@react-leaflet/core'
import {buildSquare, buildTriangle } from './Shapes.js'


const LeafletDefect = (props) => {
    const context = useLeafletContext();
    const center = context.map.latLngToContainerPoint(props.data.geojson);
    let points =null
    if (props.sides === 4) {
        points = buildSquare(center, props.rotation, props.data.radius * 2);
    } else if (props.sides === 3) {
        points = buildTriangle(center, props.rotation, props.data.radius * 1.41);
    }
    const latlngs = [];
    points.forEach((point) => {
        const latlng = context.map.containerPointToLatLng(point)
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
            <LeafletDefect data={props.data} rotation={0} sides={4}/>
        );
    } else if (props.data.shape === 'circle') { //SUF
        return (
            <DefectCircle data={props.data}/>
        );
    } else if (props.data.shape === 'triangle') { //DRA
        return (
            <LeafletDefect data={props.data} rotation={30} sides={3}/>
        );
    } else if (props.data.shape === 'diamond') { //SGN
        return (
            <LeafletDefect data={props.data} rotation={40} sides={4}/>
        );
    } else {
        return (
            <DefectCircle data={props.data}/>
        );
    }
       
}