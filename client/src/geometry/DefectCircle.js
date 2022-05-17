import { CircleMarker} from 'react-leaflet';
import { DefectPopup } from '../DefectPopup.js';

export default function DefectCircle(props) {

    return (
        <CircleMarker
            className={"fault-marker"}
            id={props.data.id}
            center={props.data.geojson}
            radius ={props.radius}
            pathOptions={{color: "#000000"}}
            stroke={true}
            weight={1}
            opacity={1}
            fillColor={"blue"}
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
        </CircleMarker>
    );   
}