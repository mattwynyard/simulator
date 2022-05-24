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
            weight={2}
            opacity={1}
            fillColor={"blue"}
            fillOpacity={1.0}
            eventHandlers={{
                click: (e) => {
                    e.target.openPopup();
                }
            }}
            > 
            <DefectPopup data ={props.data}/>       
        </CircleMarker>
    );   
}