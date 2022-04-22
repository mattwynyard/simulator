import './App.css';
import { MapContainer, CircleMarker, Polyline, Popup, ScaleControl, Pane} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef, Fragment, useCallback} from 'react';
import Centreline from './Centreline.js';
import CustomTileLayer from './CustomTileLayer.js';
import MapRef from './MapRef.js';
import FaultPoint from './FaultPoint.js';
import socketIOClient from "socket.io-client";

const SERVER_URL = "http://localhost:5000";
let start = null;
let trailStart = null;

const socket = socketIOClient(SERVER_URL, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

function App() {

  const REFRESH_RATE = 5;
  const MAX_TRAIL_SIZE = 50;
  const MAX_ZOOM = 18;
  const MIN_ZOOM = 13;
  const [isRemote] = useState(false);
  const [online, setOnline] = useState(false);
  const [position, setPosition] = useState([]);
  const [center, setCenter] = useState(JSON.parse(window.sessionStorage.getItem('center')) || [-36.81835, 174.74581]);
  const [faultPoints, setFaultPoints] = useState([]);
  const [faultLines, setFaultLines] = useState([]);
  const [trail, setTrail] = useState([]);
  const [centrelines, setCentreLines] = useState([]);
  const mapRef = useRef(null);
  const [counter, setCounter] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [realTime, setRealTime] = useState(JSON.parse(window.sessionStorage.getItem('realtime')) || false);

  useEffect(() => {
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
        setTrail(data);
        console.log(`Fetched ${data.length} trail markers in ${millis} ms`);
        
      });
      socket.on("simulator", (data) => {
        if(data === "start") {
          setRealTime(true)       
        } else if (data === "stop") {
          setRealTime(false);
        } else {
          console.log(data)
        }
        
      });
      socket.on("geometry", (data) => {
        const millis = Date.now() - start;
        if (data.centreline) {
          console.log(`Fetched ${data.centreline.length} centrelines in ${millis} ms`);
          setCentreLines(data.centreline);
        }
        if (data.inspection) {
          //console.log(`Fetched ${data.inspection.points.length} point faults in ${millis} ms`);
          //console.log(`Fetched ${data.inspection.lines.length} line faults in ${millis} ms`);
          setFaultLines(data.inspection.lines);
          setFaultPoints(data.inspection.points)
        }
      });
      socket.on("loaded", (result) => {
        let bounds = mapRef.current.getBounds();
        let center = mapRef.current.getCenter();
        start = Date.now();
        socket.emit("geometry", bounds, [center.lat, center.lng]);      
      });
      if(mapRef.current) { 
        if (realTime) { 
          mapRef.current.setMinZoom(MAX_ZOOM);
        } else {
          mapRef.current.setMinZoom(MIN_ZOOM);
          let bounds = mapRef.current.getBounds();
          let center = mapRef.current.getCenter();  
          //socket.emit("geometry", bounds, [center.lat, center.lng]);
        }
      }
      
    });
      return () => {
        socket.disconnect();  
      } 
  }, []);

  useEffect(() => {
    if (position.length > 0) {
      let ms = position[0].timestamp.split('.')[1];
      if (ms === '000') {
        let newPoint = {};
        newPoint.timestamp = position[0].timestamp;
        newPoint.bearing = position[0].bearing;
        newPoint.velocity = position[0].velocity;
        newPoint.latlng = [...position[0].latlng];
        newPoint.lock = [...position[0].lock];
        setCenter(position[0].latlng);
        setTrail(prevState => prevState.concat(newPoint));
        setCounter(counter => counter + 1); 
      }
      if (mapRef.current) {
        mapRef.current.newCenter(position[0].latlng);     
      }
    }
  }, [position, mapRef]);

  useEffect(() => {
    
    try { 
      window.sessionStorage.setItem('realtime', JSON.stringify(realTime));
      window.sessionStorage.setItem('center', JSON.stringify(center));
    } catch {
      console.log("failed to save state")
    }
    if(mapRef.current) {      
      if (realTime) { 
        console.log(`RealTime: ${realTime}`)
        //socket.emit("geometry", bounds, [center.lat, center.lng]);
        mapRef.current.setMinZoom(MAX_ZOOM);
      } else {
        mapRef.current.setMinZoom(MIN_ZOOM);
      }
    }
  }, [realTime, mapRef]);

  useEffect(() => {
      if (counter === 1 || counter % (REFRESH_RATE) === 0) {
        if(mapRef.current) {      
          let bounds = mapRef.current.getBounds();
          if (bounds) {
            start = Date.now();
            socket.emit("geometry", bounds, position[0].latlng);
          }
        }    
      }
  }, [counter, mapRef]);

  useEffect(() => {
    if (trail.length >= MAX_TRAIL_SIZE) {
      let bounds = mapRef.current.getBounds();
      if (bounds) {
        trailStart = Date.now();
        socket.emit("trail", bounds);    
      } 
    }
  }, [trail, mapRef]);

  const reset = () => {
    setFaultLines([]);
    setFaultPoints([]);
  }

  const updateGeometry = (bounds, center) => {
    if(mapRef.current) {        
      if (!realTime) {
        start = Date.now();
        socket.emit("geometry", bounds, [center.lat, center.lng]);
      }
    }
  }

  return (
    <div className="App">
      <div className="panel">
      </div>
      <MapContainer 
          className="map" 
          //center={center} 
          zoom={18} 
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          scrollWheelZoom={true}

          keyboard={true}
          eventHandlers={{
              load: () => {
                console.log('onload')
              },
            }}
        >
        <MapRef 
          ref={mapRef} 
          update={updateGeometry}
          center={position.length !== 0 ? [position[0].latlng] : center} 
          />
        
        <CustomTileLayer isRemote={isRemote}/>
         <ScaleControl name="Scale" className="scale"/>
         <Pane name="position" style={{ zIndex: 1000 }}>
          {position.map((point, idx) =>
            <CircleMarker
              className={"position"}
              key={`marker-${idx}`} 
              stroke={true}
              center={point.latlng}
              radius ={6}
              fill={true}
              color={"#3388ff"}
              fillColor={"blue"}
              fillOpacity={1.0}
              >      
            </CircleMarker>
          )}
           </Pane >
           <Pane name="trail" style={{ zIndex: 999 }}>
            {trail.map((point, idx) =>
            <Fragment key={`fragment-${idx}`} >
              <CircleMarker
                className = {"trail-marker"}
                key={`marker-${idx}`} 
                stroke={true}
                center={point.latlng}
                radius ={1}
                fill={true}
                color={"lime"}
                fillColor={"lime"}
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
                key={`markerpu-${idx}`}
                style={{ zIndex: 1000 }}   
                >
                <div>
                {`timestamp: ${point.timestamp}`}<br></br>
                {`bearing : ${point.bearing}`}<br></br> 
                {`velocity: ${point.velocity}`}<br></br> 
                {`lat: ${point.latlng[0]}`}<br></br> 
                {`lng: ${point.latlng[1]}`}<br></br> 
                </div>         
              </Popup>      
              </CircleMarker>
              <CircleMarker
                className = {"lock-marker"}
                key={`lock-${idx}`} 
                stroke={true}
                center={point.lock}
                radius ={1}
                fill={true}
                color={"#FF0000"}
                fillColor={"#FF0000"}
                fillOpacity={1.0}
                eventHandlers={{
                  click: (e) => {
                    //e.target.openPopup();
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
                key={`lockpu-${idx}`}
                style={{ zIndex: 1000 }}   
                >
                <div>
                  {`timestamp: ${point.timestamp}`}<br></br>
                  {`bearing : ${point.bearing}`}<br></br> 
                  {`velocity: ${point.velocity}`}<br></br> 
                  {`lat: ${point.lock ? point.lock[0] : null}`}<br></br> 
                  {`lng: ${point.lock ? point.lock[1] : null}`}<br></br> 
                </div>
                
              </Popup>       
            </CircleMarker>
          </Fragment>
          )}
         </Pane >
         <Pane name="lines">
          {faultLines.map((line, idx) =>
              <Polyline
                key={`marker-${idx}`} 
                style={{ zIndex: 999 }}   
                positions={line.geojson}
                idx={idx}
                color={line.color}
                weight ={line.weight}
                opacity={line.opacity}
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
                  key={`marker-${idx}`}>
                  {line.id}<br></br>    
                </Popup>            
              </Polyline>
            )}
         </Pane>
         <Pane name="points" className = {"fault-marker"} style={{ zIndex: 999 }}>
          {faultPoints.map((point, idx) =>
            <FaultPoint
              className = {"fault-marker"}
              key={point.id}
              id={point.id}
              fault={point.fault}
              center={point.geojson}
              radius ={point.radius}
              fill={point.fill}
              color={point.color}
              opacity={point.opacity}
              fillColor={point.color}
              fillOpacity={point.opacity}
              geojson={point.geojson}
            />
          )}
         </Pane>
          <Pane name="centreline" className = {"centre-line"}>
          {centrelines.map((line, idx) =>
            <Centreline
              className = {"centre-line"}
              key={`marker-${idx}`}    
              data={line}
              idx={idx}
            >           
            </Centreline>
          )}
          </Pane>    
         </MapContainer>  
    </div>
    
  );
}

export default App;