
import { Popup, Polyline} from 'react-leaflet';
export default function DefectLine(props) {

    return (
        <Polyline
            style={{ zIndex: 999 }}   
            positions={props.data.geojson}
            color={props.data.color}
            weight ={props.data.weight}
            opacity={props.data.opacity}
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