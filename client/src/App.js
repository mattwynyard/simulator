import './App.css';
import { MapContainer, CircleMarker, Polyline, Popup, ScaleControl, Pane} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef, Fragment} from 'react';
import Centreline from './Centreline.js';
import CustomTileLayer from './CustomTileLayer.js';
import MapRef from './MapRef.js';
import socketIOClient from "socket.io-client";
const SERVER_URL = "http://localhost:5000";
let start = null;

function App() {

  const REFRESH_RATE = 5;
  const DEFAULT_BUFFER_SIZE = 50;
  const [isRemote] = useState(false);
  const [online, setOnline] = useState(false);
  const [position, setPosition] = useState([]);
 
  const [center, setCenter] = useState([-36.81835, 174.74581]);
  const [points, setPoints] = useState([]);
  const [trail, setTrail] = useState([]);
  //const [lockPosition, setLockPosition] = useState([]);
  const [lines, setLines] = useState([]);
  const [centrelines, setCentreLines] = useState([]);
  const mapRef = useRef(null);
  const [counter, setCounter] = useState(0);
  const [socketApp, setSocketApp] = useState(null);
  const [markerBuffer, setMarkerBuffer] = useState(DEFAULT_BUFFER_SIZE)

  useEffect(() => {
    const socket = socketIOClient(SERVER_URL, {
      cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
      }
    });
    setSocketApp(socket)

    socket.on("connect", () => {
      console.log("connect");
      setOnline(true)
      socket.sendBuffer = []; 
      socket.on("reset", () => {
          reset();
      });
      socket.on("latlng", data => {
        setPosition([data]);   
      });

      socket.on("trail", data => {
        const millis = Date.now() - start;
        if (data.length > markerBuffer) {
          setMarkerBuffer(data.length + (DEFAULT_BUFFER_SIZE / 2)); 
        } else {
          if (data.length > DEFAULT_BUFFER_SIZE) {
            setMarkerBuffer(data.length); 
          } else {
            setMarkerBuffer(DEFAULT_BUFFER_SIZE); 
          }         
        }
        console.log(`Fetched ${data.length} trail markers in ${millis} ms`);
        setTrail(data)
      });
      socket.on("insertPoint", data => {
        insertPoint(data);
      });
      socket.on("insertLine", data => {
        insertLine(data);
      });
      // socket.on("updateLine", data => {
      //   updateLines(data);
      //});
      socket.on("centrelines", data => {

        const millis = Date.now() - start;
        console.log(`Fetched ${data.length} centrelines in ${millis} ms`)
        setCentreLines(data);
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
        p.lock = position[0].lock;
        let t = [...trail];
        if (p.lock.length !== 0) {
          t.push(p);
        }
        setTrail(t);
        setCounter(counter => counter + 1); 
      }
      if (mapRef.current) {
        mapRef.current.newCenter(position[0].latlng);     
      }
    }
  }, [position, mapRef]);

  useEffect(() => {
      if (counter === 1 || counter % (REFRESH_RATE) === 0) {
        if(mapRef.current) {      
          let bounds = mapRef.current.getBounds();
          if (bounds) {
            start = Date.now();
            socketApp.emit("centrelines", bounds, position[0].latlng);
          }
        }    
      }
  }, [counter]);

  useEffect(() => {
    console.log(`current trail length: ${trail.length} markers`);
    if (trail.length > markerBuffer) {
      let bounds = mapRef.current.getBounds();
      if (bounds) {
        start = Date.now();
        socketApp.emit("trail", bounds);    
      } 
    }
}, [trail]);

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
          <Fragment key={`fragment-${idx}`} >
            <CircleMarker
              key={`marker-${idx}`} 
              stroke={true}
              center={point.latlng}
              radius ={2}
              fill={true}
              color={"lime"}
              fillColor={"lime"}
              fillOpacity={1.0}
              eventHandlers={{
                click: () => {
                  console.log('marker clicked')
                }, 
              }}
              >      
            </CircleMarker>
            {/* <CircleMarker
            key={`lock-${idx}`} 
            stroke={true}
            center={point.lock}
            radius ={2}
            fill={true}
            color={"red"}
            fillColor={"red"}
            fillOpacity={1.0}
            eventHandlers={{
              click: () => {
                console.log('marker clicked')
              }, 
            }}
            >      
            </CircleMarker> */}
          </Fragment>
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
              data={line}
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