import { CircleMarker, Popup} from 'react-leaflet';
import { useLeafletContext } from '@react-leaflet/core';
import { getPointRadius } from './Defect.js'

export default function DefectCircle(props) {

    const map = useLeafletContext().map;
    const radius = getPointRadius(map.getZoom());

    return (
        <CircleMarker
            className={"fault-marker"}
            id={props.data.id}
            center={props.data.geojson}
            radius ={radius}
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
            <Popup
                className = {"popup"}
            >
                <div>
                    {`id: ${props.data.id}`}<br></br>
                    {`id: ${props.data.inspection}`}<br></br>
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
        </CircleMarker>
    );   
}