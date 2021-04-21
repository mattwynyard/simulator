import './App.css';
import { MapContainer, TileLayer, CircleMarker, ScaleControl} from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect} from 'react';

function App() {

  const [counter, setCounter] = useState(0);
  const [latlng, setPosition] = useState([]);
  const [points, setPoints] = useState([]);
  const [host] = useState("localhost:5000");

  useEffect(
    () => {
        const id = setInterval(() => {
        setCounter(counter + 1); 
        getData().then(data => {
            //console.log(data);
            if (data.latlng !== null) {
              try {
                let lat = data.latlng[0];
                let lng = data.latlng[1];
                setPosition([L.latLng(lat, lng)]);     
              } catch {
                console.log("error")
              }     
            }
            if (data.faults !== null) {
              console.log(data.faults)
              setPoints(data.faults)
            }
             
        });           
        }, 1000);
        return () => {
        clearInterval(id);
        };
    },
    [counter],
);
const getData = async () => {
        
  try {
      const response = await fetch("http://" + host + '/position', {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',        
          },
         
      });
      if (response.ok) {
          const body = await response.json();
          console.log(body);

          return body; 
      } else {
          
          return Error(response);
      }
  } catch {
      return new Error("connection error")
  }      
};

  return (
    <div className="App">
       <MapContainer 
            className="map" 
            center={[-36.81835, 174.74581]} 
            zoom={12} 
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
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          //url="http://localhost:5000/auckland/{z}/{x}/{y}.png"
        />
         <ScaleControl name="Scale" className="scale"/>
         {latlng.map((position, idx) =>
            <CircleMarker
              key={`marker-${idx}`} 
              center={position}
              radius ={5}
              fill={true}
              fillOpacity={1.0}
              eventHandlers={{
                click: () => {
                  console.log('marker clicked')
                },
              }}
              >        
            </CircleMarker>
          )}
          {points.map((position, idx) =>
            <CircleMarker
              key={`marker-${idx}`} 
              center={L.latLng(position.LatLng[0], position.LatLng[1])}
              radius ={4}
              fill={true}
              color={"red"}
              fillOpacity={1.0}
              eventHandlers={{
                click: () => {
                  console.log('marker clicked')
                },
              }}
              >        
            </CircleMarker>
          )}
          
         </MapContainer>
    </div>
  );
}

export default App;
