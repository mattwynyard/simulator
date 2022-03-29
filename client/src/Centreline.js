import { Polyline } from 'react-leaflet';

function Centreline(props) {
    const redOptions = { color: 'red' }
    let otherOptions = null;
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
      if(props.idx % 2 === 0) {
          otherOptions = { color: 'orange' }
      } else {
        otherOptions = { color: 'blue' }
    } 
    return ( <Polyline
        key={`marker-${props.idx}`} 
        pathOptions={(props.idx === 0) ? redOptions: otherOptions}
        positions={coords} 
        weight={3}
        >
      </Polyline>);
  }

  export default Centreline;