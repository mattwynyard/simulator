import './App.css';
import AntDrawer from'./AntDrawer.js'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, ScaleControl, useMap} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useCallback, useRef} from 'react';

function MapRef(props) {
  const [counter, setCounter] = useState(0);
  const map = useMap();
  useEffect(
    () => {
        const id = setInterval(() => {
          setCounter(counter + 1);    
          let bounds = map.getBounds();
          //console.log(bounds)
        }, 10000);
        return () => {
          clearInterval(id);
        };
    },
    [counter],
    );
    if (props.center.length !== 0) {
      map.panTo(props.center[0])
    }
    return null
  }

function CustomTileLayer(props) {
  if (props.isRemote) {
    return (
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="http://localhost:5000/auckland/{z}/{x}/{y}.png"
      />
    );
  } else {
    return (
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    );
  }
}

function App() {

  const [counter, setCounter] = useState(0);
  const [initialise, setIntialise] = useState(false);
  const [isRemote] = useState(false);
  const [position, setPosition] = useState([]);
  const [center, setCenter] = useState([-36.81835, 174.74581]);
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [host] = useState("localhost:5000");
  const [timerInterval] = useState(500);

  const getData = useCallback(async () => {      
    try {
        const response = await fetch("http://" + "localhost:5000" + '/position', {
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
            
            return Error(response);
        }
    } catch {
        return new Error("connection error")
    }      
  }, []);
  

  useEffect(
    () => {
        const id = setInterval(() => {
        setCounter(counter + 1);
        
          getData().then(data => {
              if (data.latlng) {
                try{
                  let lat = data.latlng[0];
                  let lng = data.latlng[1];
                  setPosition([L.latLng(lat, lng)]);
                  if (!initialise) {
                    setCenter([L.latLng(lat, lng)]);
                    setIntialise(true);
                  }
                } catch {
                  console.log("position error");
                }     
              }
              if (data.faults) {
                try {
                    setPoints(data.faults);      
                } catch (e) {
                  console.log("fault error: " + e)
                } 
            }    
          });
        }, timerInterval);
        return () => {
        clearInterval(id);
        };
    },
    [counter, timerInterval, initialise, getData],
);

useEffect(
  () => {
    if (counter % 10 === 0) {
      setCenter(position);
    }
  },
  [position, counter],
);

  return (
    <div className="App">
      
      <MapContainer 
          className="map" 
          center={center} 
          zoom={18} 
          minZoom={10}
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
          {points.map((point, idx) =>
            <CircleMarker
              key={`marker-${idx}`} 
              center={L.latLng(point.latlng[0], point.latlng[1])}
              radius ={point.radius}
              fill={true}
              color={point.color}
              fillColor={point.color}
              fillOpacity={point.opacity}
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
                  id: {point.id}<br></br>
              </Popup>       
            </CircleMarker>
          )}
          {lines.map((line, idx) =>
            <Polyline
              positions={line.latlngs}
              color={line.color}
            >           
            </Polyline>
          )} 
          <MapRef center={center}></MapRef>  
         </MapContainer>
         <AntDrawer className="drawer" ></AntDrawer>
         
    </div>
  );
}

export default App;
