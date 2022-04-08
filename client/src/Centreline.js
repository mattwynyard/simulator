import { Polyline } from 'react-leaflet';

function Centreline(props) {
    const color = { color: 'blue' }
    return ( <Polyline
        key={`marker-${props.idx}`} 
        pathOptions={props.data.color ? props.data.color : color}
        positions={props.data.geojson} 
        cwid={props.data.cwid} 
        label={props.data.label} 
        roadid={props.data.roadid}
        weight={props.data.weight ? props.data.weight : 4}
        opacity={props.data.opacity ? props.data.opacity: 0.5}
        >
      </Polyline>);
  }

  export default Centreline;