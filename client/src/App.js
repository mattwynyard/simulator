import './App.css';
import { MapContainer, CircleMarker, Polyline, Popup, ScaleControl, Pane} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef} from 'react';
import Centreline from './Centreline.js';
import CustomTileLayer from './CustomTileLayer.js';
import MapRef from './MapRef.js';
import socketIOClient from "socket.io-client";
const SERVER_URL = "http://localhost:5000";

function App() {

  const [isRemote] = useState(false);
  const [online, setOnline] = useState(false);
  //const [position, setPosition] = useState([L.latLng(-36.81835, 174.74581)]);
  const [position, setPosition] = useState([]);
  const [center, setCenter] = useState([-36.81835, 174.74581]);
  const [points, setPoints] = useState([]);
  const [trail, setTrail] = useState([]);
  const [lines, setLines] = useState([]);
  const [centrelines, setCentreLines] = useState([]);
  const mapRef = useRef(null);
  const [counter, setCounter] = useState(0);
  const [frequency, setFrequency] = useState(null) //access rate in milliseconds

  const REFRESH_RATE = 5;

  useEffect(() => {
    const socket = socketIOClient(SERVER_URL, {
      cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
      }
    });
    socket.on("connect", () => {
      console.log("connect");
      setOnline(true)
      socket.sendBuffer = []; 
      socket.on("reset", () => {
          reset();
        });
        socket.on("latlng", data => {
          setPosition([data]);

          let freq = 1000 / data.rate
          setFrequency(freq);
      
        });
        // socket.on("trail", data => {
        //   console.log(data);
        //   setTrail(data)
        // });
        socket.on("insertPoint", data => {
          insertPoint(data);
        });
        socket.on("insertLine", data => {
          insertLine(data);
        });
        socket.on("updateLine", data => {
          //updateLines(data);
        });
        socket.on("centreline", data => {
          updateCentrelines(data);
        });
        socket.on("inspection", data => {
          console.log(data);
        });
    });
    return () => socket.disconnect();   
  }, []);

  useEffect(() => {
    if (position.length > 0) {
      setCenter(position[0].latlng);
      let ms = position[0].timestamp.split('.')[1];
      if (ms === '000') {
        let p = {};
        p.timestamp = position[0].timestamp;
        p.bearing = position[0].bearing;
        p.velocity = position[0].velocity;
        p.latlng = position[0].latlng;
        let t = [...trail]
        t.push(p);
        setTrail(t);
      }
      
      // if (mapRef) {
      //   socket.emit("trail", mapRef.current.getBounds());
      // }
      
      if (mapRef.current) {
        mapRef.current.newCenter(position[0].latlng);
        setCounter(counter => counter + 1);  
      }
    }
  }, [position]);

  useEffect(() => {
      if (counter === 1 || counter % (REFRESH_RATE * frequency) === 0) {
        refreshUI();     
      }
  }, [counter, frequency]);

  const refreshUI = (() => {
    if(mapRef.current) {      
      let bounds = mapRef.current.getBounds();
      if (bounds) {
          refreshCentrelines(bounds);    
      } 
    }       
  });

  const refreshCentrelines = ((bounds) => {
    let response = getCentrelines(bounds, {lat: position[0].lat, lng: position[0].lng});     
    response.then((body) => {
      let cl = []
      if (body.data) {
        for (let i = 0; i < body.data.length; i++) {
          cl.push(body.data[i])
      }
      setCentreLines(cl);
      }     
    });
  })

  const insertPoint = (point) => {
    setPoints(points => [...points, point]);
  }

  const insertLine = (line) => {
    setLines(lines => [...lines, line]);
  }

  const updateLines = (lines) => {
    console.log(lines)
    setLines([lines]);
  }

  const updateCentrelines = (data) => {
    //console.log(data)
    //setLines([lines]);
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
          //center={center} 
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
          {position.map((point, idx) =>
            <CircleMarker
              key={`marker-${idx}`} 
              stroke={true}
              center={point.latlng}
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
          {trail.map((point, idx) =>
            <CircleMarker
              key={`marker-${idx}`} 
              stroke={true}
              center={point.latlng}
              radius ={4}
              fill={true}
              color={"green"}
              fillColor={"green"}
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
          <MapRef 
            ref={mapRef} 
            center={position.length !== 0 ? position[0].latlng : center} 
            />  
         </MapContainer>  
    </div>
    
  );
}

export default App;