import './FaultPoint.css';
import { CircleMarker, Popup } from 'react-leaflet';

export default function FaultPoint(props) {

    return (
        <CircleMarker
            id={props.id}
            center={props.geojson}
            radius ={props.radius}
            stroke={props.stroke}
            fill={props.fill}
            color={props.color}
            opacity={props.opacity}
            fillColor={props.fillColor}
            fillOpacity={props.fillOpacity}
            eventHandlers={{
            mouseover: (e) => {
                console.log("mouseover")
                e.target.openPopup();
            },
            mouseout: (e) => {
                e.target.closePopup();
            }
            }}
            > 
            <Popup
                className = {"popup"}
                autoClose={false} 
            >
                <div>
                    {`id: ${props.id}`}<br></br>
                    {`fault: ${props.fault}`}<br></br>
                    {`color: ${props.color}`}<br></br>
                    {`fill color : ${props.fillColor}`}<br></br> 
                    {`lat: ${props.geojson[0]}`}<br></br> 
                    {`lng: ${props.geojson[1]}`}<br></br> 
                </div> 
            </Popup>       
        </CircleMarker>
    );   
}