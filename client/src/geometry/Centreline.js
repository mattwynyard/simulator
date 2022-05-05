import { Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

function Centreline(props) {
    const color = { color: 'blue' }
    return ( <Polyline
        key={`marker-${props.idx}`} 
        pathOptions={props.data.color ? props.data.color : color}
        positions={props.data.geojson} 
        cwid={props.data.cwid} 
        label={props.data.label} 
        roadid={props.data.roadid}
        weight={props.data.weight ? props.data.weight : 3}
        opacity={props.data.opacity ? props.data.opacity: 0.5}
        style={{ zIndex: 900 }}
        //renderer={L.canvas({ padding: 0.5 })}
        eventHandlers={{
            click: (e) => {
                e.target.openPopup();
              },
            // mouseover: (e) => {
            //     e.target.openPopup();
            // },
            // mouseout: (e) => {
            //     e.target.closePopup();
            // }
        }}
        >
        <Popup
            className = {"popup"}
            autoPan={false}
            closeOnClick={true}
        >
            <div>
                {`Id: ${props.data.cwid}`}<br></br>
                {`Name: ${props.data.label}`}<br></br>
                {`Road Id: ${props.data.roadid}`}<br></br>
                {`Status: ${props.data.status}`}<br></br> 

            </div> 
        </Popup>     
      </Polyline>);
  }

  export default Centreline;