
import { CircleMarker, Popup} from 'react-leaflet';

export default function TrailMarker(props) {
    return (
        <>
            <CircleMarker
              className = {"trail-marker"}
              stroke={true}
              center={props.point.latlng}
              radius ={1}
              fill={true}
              color={"lime"}
              fillColor={"lime"}
              fillOpacity={1.0}
              style={{ zIndex: 900 }}   
              eventHandlers={{
                click: (e) => {
                  e.target.openPopup();
                },
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
                    {`timestamp: ${props.point.timestamp}`}<br></br>
                    {`bearing : ${props.point.bearing}`}<br></br> 
                    {`velocity: ${props.point.velocity}`}<br></br> 
                    {`lat: ${props.point.latlng[0]}`}<br></br> 
                    {`lng: ${props.point.latlng[1]}`}<br></br> 
                  </div>         
                </Popup>      
              </CircleMarker>
              <CircleMarker
                className = {"lock-marker"}
                stroke={true}
                center={props.point.lock}
                radius ={1}
                fill={true}
                color={"#FF0000"}
                fillColor={"#FF0000"}
                fillOpacity={1.0}
                eventHandlers={{
                  click: (e) => {
                    e.target.openPopup();
                  },
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
                  {`timestamp: ${props.point.timestamp}`}<br></br>
                  {`bearing : ${props.point.bearing}`}<br></br> 
                  {`velocity: ${props.point.velocity}`}<br></br> 
                  {`lat: ${props.point.lock ? props.point.lock[0] : null}`}<br></br> 
                  {`lng: ${props.point.lock ? props.point.lock[1] : null}`}<br></br> 
                </div>
                
              </Popup>       
            </CircleMarker>
          </>
    )
}