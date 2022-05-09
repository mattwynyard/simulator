import { CircleMarker} from 'react-leaflet';
import { DefectPopup } from '../DefectPopup.js'

export default function DefectCircle(props) {
    return (
        <CircleMarker
            className={"fault-marker"}
            id={props.data.id}
            center={props.data.geojson}
            radius ={props.radius}
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
        </CircleMarker>
    );   
}