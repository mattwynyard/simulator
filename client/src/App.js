import './App.css';
import { MapContainer, CircleMarker, Polyline, Popup, ScaleControl, Pane} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef} from 'react';
import Centreline from './Centreline.js';
import CustomTileLayer from './CustomTileLayer.js';
import Socket from './Socket.js';
import MapRef from './MapRef.js';

function App() {

  const [online, setOnline] = useState(false);
  const [isRemote] = useState(false);
  const [position, setPosition] = useState([L.latLng(-36.81835, 174.74581)]);
  const [center, setCenter] = useState([-36.81835, 174.74581]);
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [centrelines, setCentreLines] = useState([]);
  const mapRef = useRef(null);

  useEffect(
    () => {
      const initialise = async () => {
        try {
          const response = await fetch("http://localhost:5000/initialise", {
              method: 'GET',
              credentials: 'same-origin',
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',        
              },      
          });
          if (response.ok) {
              const body = await response.json();
              return body; 
          } else { 
            console.log(response)
            return response;
          }
        } catch (error) {
          console.log(error)
          return error;
        }
      }
      if (!online) {
        console.log("initialise")
        initialise()
        .then((res) => {    
          setOnline(true)    
        })
        .catch(console.error);  
      }
      console.log("mount")
  }, [online]);

  useEffect(() => {
    setCenter(position);
    if(mapRef.current) {
      mapRef.current.newCenter(position[0]);
      let bounds = mapRef.current.getBounds();
      if (bounds) {
        let response = getCentrelines(bounds, {lat: position[0].lat, lng: position[0].lng});     
        response.then((body) => {
          let cl = []
          for (let i = 0; i < body.data.length; i++) {
              cl.push(body.data[i])
          }
          setCentreLines(cl);
        });
      }
    }    
  }, [position]);

  const insertPoint = (point) => {
    setPoints(points => [...points, point]);
  }

  const insertLine = (line) => {
    setLines(lines => [...lines, line]);
  }

  const reset = () => {
    setLines([]);
    setPoints([]);
  }
  
  const getCentrelines = async (bounds, center)=> {
    try {
      const response = await fetch("http://localhost:5000/centrelines", {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',        
          },  
          body: JSON.stringify({
            bounds: bounds,
            center: center
        })    
      });
      if (response.ok) {
          const body = await response.json();
          return body; 
      } else {         
          return Error(response);
      }
    } catch {
        return new Error("connection error")
    }      
  }

  return (
    <div className="App">
      <MapContainer 
          className="map" 
          center={center} 
          zoom={18} 
          minZoom={13}
          maxZoom={18}
          scrollWheelZoom={true}
          keyboard={true}
          eventHandlers={{
              load: () => {
                console.log('onload')
              },
            }}
        >
        <CustomTileLayer isRemote={isRemote}/>
         <ScaleControl name="Scale" className="scale"/>
         <Pane name="position" style={{ zIndex: 1000 }}>
          {position.map((position, idx) =>
            <CircleMarker
              key={`marker-${idx}`} 
              stroke={true}
              center={position}
              radius ={6}
              fill={true}
              color={"#3388ff"}
              fillColor={"blue"}
              fillOpacity={1.0}
              eventHandlers={{
                click: () => {
                  console.log('marker clicked')
                }, 
              }}
              >      
            </CircleMarker>
          )}
          </Pane >
           
         <Pane name="lines" style={{ zIndex: 990 }}>
         {lines.map((line, idx) =>
            <Polyline
              key={`marker-${idx}`} 
              style={{ zIndex: 999 }}   
              positions={line.latlng}
              idx={idx}
              color={line.color}
              weight ={line.weight}
              opacity={line.opacity}
              eventHandlers={{
                click: () => {
                  console.log('line clicked')
                },
                mouseover: (e) => {
                  console.log("mouse over")
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.closePopup();
                }
              }}
            > 
            <Popup
                key={`marker-${idx}`}>
                  {line.id}<br></br>
                  
              </Popup>            
            </Polyline>
          )}
         </Pane>
         <Pane name="points" style={{ zIndex: 990}}>
         {points.map((point, idx) =>
            <CircleMarker
              key={`marker-${idx}`} 
              center={L.latLng(point.latlng[0], point.latlng[1])}
              radius ={point.radius}
              fill={point.fill}
              color={point.color}
              opacity={point.opacity}
              fillColor={point.fillColor}
              fillOpacity={point.fillOpacity}
              eventHandlers={{
                click: () => {
                  console.log('marker clicked')
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
                key={`marker-${idx}`}>
                  {point.id}<br></br>
                  {point.fault}<br></br>
              </Popup>       
            </CircleMarker>
          )}
         </Pane>
          <Pane name="centreline" style={{ zIndex: 900}}>
          {centrelines.map((line, idx) =>
            <Centreline
              key={`marker-${idx}`}    
              positions={line}
              idx={idx}
            >           
            </Centreline>
          )}
          </Pane>  
          <MapRef ref={mapRef} center={center} getCentrelines={getCentrelines}></MapRef>  
          <Socket setPosition={setPosition} insertPoint={insertPoint} insertLine={insertLine} reset={reset}/>
         </MapContainer>  
    </div>
  );
}

export default App;
