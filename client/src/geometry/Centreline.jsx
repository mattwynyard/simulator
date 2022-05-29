import { Polyline, Popup } from 'react-leaflet';

function Centreline(props) {

    return ( <Polyline
        pathOptions={props.data.color ? { color: props.data.color} : { color: 'blue' }}
        positions={props.data.geojson} 
        weight={props.weight}
        opacity={0.5}
        style={{ zIndex: 990 }}
        eventHandlers={{
            click: (e) => {
                e.target.openPopup();
              },
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