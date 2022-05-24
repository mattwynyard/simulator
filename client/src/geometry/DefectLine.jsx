
import { Popup, Polyline} from 'react-leaflet';
import { getColor } from '../Utilities/Geometry.js';
import { useMemo } from 'react'
export default function DefectLine(props) {
    const color = useMemo(() => getColor(props.data.priority), [props.data.priority])

    return (
        <Polyline
            style={{ zIndex: 999 }}   
            positions={props.data.geojson}
            color={color}
            weight ={10}
            opacity={1.0}
            eventHandlers={{
                click: (e) => {
                e.target.openPopup();
                },
            }}
            > 
            <Popup
                className = {"popup"}>
                {props.data.id}<br></br>    
            </Popup>            
        </Polyline>
    );
}