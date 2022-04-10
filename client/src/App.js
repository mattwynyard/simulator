import './App.css';
import { MapContainer, CircleMarker, Polyline, Popup, ScaleControl, Pane} from 'react-leaflet';
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
  const MAX_TRAIL_SIZE = 50;
  const [isRemote] = useState(false);
  const [online, setOnline] = useState(false);
  const [position, setPosition] = useState([]);
  const [center, setCenter] = useState([-36.81835, 174.74581]);
  const [faultPoints, setFaultPoints] = useState([]);
  const [faultLines, setFaultLines] = useState([]);
  const [trail, setTrail] = useState([]);
  const [centrelines, setCentreLines] = useState([]);
  const mapRef = useRef(null);
  const [counter, setCounter] = useState(0);
  const [socketApp, setSocketApp] = useState(null);
  //const [markerBuffer, setMarkerBuffer] = useState(DEFAULT_BUFFER_SIZE);

  useEffect(() => {
    const socket = socketIOClient(SERVER_URL, {
      cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
      }
    });
    setSocketApp(socket);
    socket.on("connect", () => {
      setOnline(true)
      socket.sendBuffer = []; 
      socket.on("reset", () => {
          reset();
      });
      socket.on("latlng", (data) => {
        setPosition([data]);   
      });
      socket.on("trail", (data) => {
        const millis = Date.now() - start;
        if (data.length > MAX_TRAIL_SIZE) {
          setTrail(data.slice(MAX_TRAIL_SIZE))        
        } else {
          setTrail(data);
        }
        console.log(`Fetched ${data.length} trail markers in ${millis} ms`);
        
      });
      socket.on("centrelines", (data) => {
        const millis = Date.now() - start;
        console.log(`Fetched ${data.length} centrelines in ${millis} ms`)
        setCentreLines(data);
      });
      socket.on("inspection", (inspection) => {
        let lines = [];
        let points = []
        inspection.data.forEach((row) => {
          if (row.type === 'point') {
            points.push(row);
          } else if (row.type = 'line') {
            lines.push(row);
          }
        });
        setFaultLines(lines);
        setFaultPoints(points)
      });
    });
      return () => {
        socket.disconnect();  
      } 
  }, []);

  useEffect(() => {
    if (position.length > 0) {

      let ms = position[0].timestamp.split('.')[1];
      if (ms === '000') {
        let p = {};
        p.timestamp = position[0].timestamp;
        p.bearing = position[0].bearing;
        p.velocity = position[0].velocity;
        p.latlng = [...position[0].latlng];
        p.lock = [...position[0].lock];
        let t = [...trail];
        if (p.lock.length !== 0) {
          t.push(p);
        }
        setCenter([...position[0].latlng]);
        setTrail(t);
        setCounter(counter => counter + 1); 
      }
      if (mapRef.current) {
        mapRef.current.newCenter([...position[0].latlng]);     
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
    if (trail.length >= MAX_TRAIL_SIZE) {
      let bounds = mapRef.current.getBounds();
      if (bounds) {
        start = Date.now();
        socketApp.emit("trail", bounds);    
      } 
    }
  }, [trail]);


  const reset = () => {
    setFaultLines([]);
    setFaultPoints([]);
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
            <Popup
              key={`markerpu-${idx}`}>
              {`timestamp: ${point.timestamp}`}<br></br>
              {`bearing : ${point.bearing}`}<br></br> 
              {`velocity: ${point.velocity}`}<br></br> 
              {`lat: ${point.latlng[0]}`}<br></br> 
              {`lng: ${point.latlng[1]}`}<br></br> 
            </Popup>      
            </CircleMarker>
            <CircleMarker
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
            <Popup
            key={`lockpu-${idx}`}>
            {`timestamp: ${point.timestamp}`}<br></br>
            {`bearing : ${point.bearing}`}<br></br> 
            {`velocity: ${point.velocity}`}<br></br> 
            {`lat: ${point.latlng[0]}`}<br></br> 
            {`lng: ${point.latlng[1]}`}<br></br> 
          </Popup>       
            </CircleMarker>
          </Fragment>
          )}
          </Pane >
           
         <Pane name="lines" style={{ zIndex: 990 }}>
          {faultLines.map((line, idx) =>
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
         {faultPoints.map((point, idx) =>
            <CircleMarker
              key={`marker-${idx}`} 
              center={point.latlng}
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
            center={position.length !== 0 ? [position[0].latlng] : center} 
            />  
         </MapContainer>  
    </div>
    
  );
}

export default App;