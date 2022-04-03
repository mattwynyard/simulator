import { Polyline } from 'react-leaflet';

function Centreline(props) {
    const color = { color: 'blue' }
    let geojson = JSON.parse(props.positions.geojson);
    let coords = []
    geojson.coordinates.forEach(element => {
        element.forEach(coord => {
          let temp = coord[0];
          coord[0] = coord[1];
          coord[1] = temp;
          coords.push(coord)
        });     
    });
    return ( <Polyline
        key={`marker-${props.idx}`} 
        pathOptions={props.color ? props.color : color}
        positions={coords} 
        weight={props.weight ? props.weight : 3}
        >
      </Polyline>);
  }

  export default Centreline;