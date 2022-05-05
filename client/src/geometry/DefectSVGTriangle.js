import {divIcon} from 'leaflet';
import { useLeafletContext } from '@react-leaflet/core';
import { Marker, Popup} from 'react-leaflet';
import ReactDOMServer from 'react-dom/server';

const buildTriangle = (center, rotation, size) => {
    let points = "";
    for (let i = 0; i < 3; i++) {
        const x = Math.round(center.x + size * Math.cos(rotation + i * 2 * Math.PI / 3));
        if (i === 0) {
            points = points.concat(x);
        } else {
            points = points.concat(' ', x);
        }
        const y = Math.round(center.y + size * Math.sin(rotation + i * 2 * Math.PI / 3));
        points = points.concat(',', y)
    }
    return points
}

const IconTriangle = (props) => {
    const size = `0 0 ${props.size} ${props.size}`
    const points = buildTriangle(props.center, 0, props.size);
    //console.log(points)
    return (
      <svg 
        width={props.size} height={props.size} viewBox={size}>
          {/* <polygon points={points} stroke={props.color} fill={props.fillcolor} 
          strokeOpacity={props.opacity} fillOpacity={props.fillopacity}/> */}
          <polygon points={points}/>
      </svg>
    );
}

export default function DefectSVGTriangle(props) {
    const context = useLeafletContext();
    const center = context.map.latLngToContainerPoint(props.data.geojson);
    const size = props.data.radius * 2
    const icon = divIcon({
        className: 'triangle-svg',
        iconSize: [size, size],
        html: ReactDOMServer.renderToString(<IconTriangle center={center} size={size} color={props.data.color} 
            fillcolor={props.data.fillcolor} opacity={props.data.opacity} fillopacity={props.data.fillopacity}
            />),
});

    return (
        <Marker
            position={props.data.geojson}
            icon={icon}
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
                    {`inspection: ${props.data.inspection}`}<br></br>
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
         </Marker>   
    );
}