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
            weight={props.weight}
            opacity={1}
            fillColor={"blue"}
            fillOpacity={1.0}
            eventHandlers={{
                click: (e) => {
                    props.onClick(e, props.data)
                }
            }}
            >     
        </CircleMarker>
    );   
}