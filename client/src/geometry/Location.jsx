import { Polygon, useMap } from 'react-leaflet';
import { buildLocationTriangle } from './Shapes.js';
import { CircleMarker} from 'react-leaflet';

export const LeafletTriangle = (props) => {
    const map = useMap();
    const points = buildLocationTriangle(props.center, props.data.bearing + 30, props.radius * 3);
    const latlngs = [];
    points.forEach((point) => {
        const latlng = map.containerPointToLatLng(point)
        latlngs.push(latlng)
    })
    return (
        <Polygon 
            positions={latlngs}
            pathOptions={{color: props.color}}
            stroke={true}
            weight={2}
            opacity={1.0}
            fillColor={props.color}
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
        </Polygon>

    );
}

export default function Location(props) {
    const map = useMap();
    if (props.data.length !== 0) {
        const center = map.latLngToContainerPoint(props.data[0].latlng);
        return (
            <>
            
            <CircleMarker
                center={props.data[0].latlng}
                radius ={27}
                pathOptions={{color: "grey"}}
                stroke={true}
                weight={1}
                opacity={1}
                fillColor={"grey"}
                fillOpacity={0.8}
            >
            </CircleMarker>
            
            <LeafletTriangle  
                data={props.data[0]} 
                radius={9} 
                center={center} 
                color={"blue"}
            >   
            </LeafletTriangle>
            {/* <CircleMarker
                center={props.data[0].latlng}
                radius ={27}
                pathOptions={{color: "white"}}
                stroke={true}
                weight={2}
                opacity={1}
            >
            </CircleMarker> */}
                
            </>   
        ) 
    } else {
        return null;
    }
    
}