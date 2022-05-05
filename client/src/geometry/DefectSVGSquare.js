import { divIcon } from 'leaflet';
import './Defect.css'
import { Marker, Popup} from 'react-leaflet';
import ReactDOMServer from 'react-dom/server';

function IconSqaure(props) {
    const size = ` 0 0 ${props.size} ${props.size}`
    return (
      <svg 
        //className='defect-svg' 
        viewBox={size}
        //width={props.size} 
        //height={props.size} 
        >
          <rect 
            className='defect-svg' 
            width={props.size} 
            height={props.size} 
            stroke={props.color} 
            fill={props.fillcolor} 
            strokeOpacity={props.opacity} 
            fillOpacity={props.fillopacity}
            />
      </svg>
    );
}

export default function DefectSVGSquare(props) {
    const size = props.data.radius * 2
    const icon = divIcon({
        className: 'defect-divicon',
        iconSize: [size, size],
        iconAnchor: [props.data.radius, props.data.radius],
        html: ReactDOMServer.renderToString(<IconSqaure size={size} color={props.data.color} fillcolor={props.data.fillcolor}
            opacity={props.data.opacity} fillopacity={props.data.fillopacity}/>),
      });
    
    return (
        <Marker
            position={props.data.geojson}
            icon={icon}
            eventHandlers={{
                // mouseover: (e) => {
                //     e.target.openPopup();
                // },
                // mouseout: (e) => {
                //     e.target.closePopup();
                // }
                click: (e) => {
                    e.target.openPopup();
                }
            }}
         >
            <Popup
                className = {"popup"}
                autoPan={false}
                closeOnClick={true}
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