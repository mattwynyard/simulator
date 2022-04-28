import './FaultPoint.css';
import { CircleMarker, Popup} from 'react-leaflet';

export default function FaultPoint(props) {

    return (
        <CircleMarker
            className={"fault-marker"}
            id={props.id}
            center={props.geojson}
            radius ={props.radius}
            stroke={props.stroke}
            fill={props.fill}
            color={props.color}
            opacity={props.opacity}
            fillColor={props.fillColor}
            //renderer={myRenderer}
            fillOpacity={props.fillOpacity}
        
            eventHandlers={{
                click: (e) => {
                    //e.target.openPopup();
                  },
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