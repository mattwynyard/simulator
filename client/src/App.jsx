import './App.css';
import { MapContainer, ScaleControl, LayerGroup, LayersControl, Pane} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef} from 'react';
import Centrelines from './geometry/Centrelines.jsx';
import CustomTileLayer from './components/CustomTileLayer.jsx';
import MapRef from './MapRef.js';
import { DragableCard } from './components/DraggableCard.jsx';
import DefectPoints from './geometry/DefectPoints.jsx';
import DefectPolygons from './geometry/DefectPolygons.jsx';
import { DefectCardBody, DefectCardHeader } from './components/DefectCard.jsx';
import TrailMarker from './geometry/TrailMarker.jsx';
import socketIOClient from "socket.io-client";
import Location from './geometry/Location.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  const [position, setPosition] = useState([]);
  const [center, setCenter] = useState(JSON.parse(window.sessionStorage.getItem('center')) || [-36.81835, 174.74581]);
  const [faultPoints, setFaultPoints] = useState([]);
  const [faultSigns, setFaultSigns] = useState([]);
  const [faultLines, setFaultLines] = useState([]);
  const [trail, setTrail] = useState([]);
  const [centrelines, setCentreLines] = useState([]);
  const mapRef = useRef(null);
  const [counter, setCounter] = useState(0);
  const [realTime, setRealTime] = useState(JSON.parse(window.sessionStorage.getItem('realtime')) || false);
  const [showDefectCard, setShowDefectCard] = useState(false)
  const [cardData, setCardData] = useState(null)

  useEffect(() => {
      socket.on("connect", () => {
      socket.sendBuffer = [];
      socket.on("reset", () => { 
        reset();
      });
      socket.on("latlng", (data) => {
        setPosition([data]);   
      });
      socket.on("trail", (data) => {
        const millis = Date.now() - trailStart;
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
          setFaultLines(data.inspection.lines);
          setFaultPoints(data.inspection.points)
          setFaultSigns(data.inspection.signs)
        }
      });
      socket.on("status", (result) => {
        console.log(result)
        let bounds = mapRef.current.getBounds();
        start = Date.now();
        socket.emit("geometry", bounds, "centreline"); 
      });
      socket.on("insert", (result) => {
        let bounds = mapRef.current.getBounds();
        start = Date.now();
        socket.emit("geometry", bounds, "inspection"); 
      });
      socket.on("loaded", (result) => {
        console.log(result)
        let bounds = mapRef.current.getBounds();
        start = Date.now();
        socket.emit("geometry", bounds, "both");      
      });
      try { 
        let realtime = JSON.parse(window.sessionStorage.getItem('realtime'));
        if (realtime) { 
          mapRef.current.setMinZoom(MAX_ZOOM);
        } else {
          mapRef.current.setMinZoom(MIN_ZOOM);
        }
        setRealTime(realtime);
      } catch {
        console.log("failed to save state")
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
    } catch {
      console.log("failed to save state")
    }
    if(mapRef.current) {      
      if (realTime) { 
        console.log(`RealTime: ${realTime}`);
        mapRef.current.setMinZoom(MAX_ZOOM);
      } else {
        mapRef.current.setMinZoom(MIN_ZOOM);
      }
    }
  }, [realTime, mapRef]);

  useEffect(() => {
    window.sessionStorage.setItem('center', JSON.stringify(center));
  }, [center])

  useEffect(() => {
      if (counter % REFRESH_RATE === 0) {
        if(mapRef.current) {      
          let bounds = mapRef.current.getBounds();
          if (bounds) {
            start = Date.now();
            socket.emit("geometry", bounds, "both");
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
    setFaultSigns([]);
    setCentreLines([]);
  }

  const updateGeometry = (bounds, types) => {
    if(mapRef.current) {        
      if (!realTime) {
        start = Date.now();
        setCentreLines([]);
        socket.emit("geometry", bounds, "both");
      }
    }
  }

  const handleMarkerClick = (e, data) => {
    setShowDefectCard(true)
    setCardData(data)
  }
  const hideCard = (e) => {
    if (showDefectCard) {
      setShowDefectCard(false)
    }
  }

  const onMouseMove = (e) => {
  }

  const onMouseUp = (e) => {
  }

  return (
    <>
      <div 
        className= "panel"
        onMouseMove={(e) => onMouseMove(e)}
        onMouseUp={(e) => onMouseUp(e)}
      >
        <DragableCard
          show={showDefectCard}
          data={cardData}
          close={hideCard}
          header={<DefectCardHeader 
            data={cardData} 
            
            />}
          body= {<DefectCardBody 
            data={cardData}
            />}
          />
          
      <MapContainer 
          className="map" 
          zoom={18} 
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          scrollWheelZoom={true}
          keyboard={true}
        >
          
        <MapRef 
          ref={mapRef} 
          update={updateGeometry}
          center={position.length !== 0 ? [position[0].latlng] : center} 
          />      
        <CustomTileLayer isRemote={isRemote}/>
        <ScaleControl name="Scale" className="scale"/>
        <LayersControl position="topright">
         <LayersControl.Overlay checked name="Faults">
         <LayerGroup>
          <Pane name="faults" className={"faults"}>
              <DefectPolygons
                data={faultLines}
                onClick={handleMarkerClick}
              /> 
            <DefectPoints
              data={faultPoints}
              onClick={handleMarkerClick}
            />
            </Pane>
         </LayerGroup>
         </LayersControl.Overlay>
         <LayersControl.Overlay checked name="Signs">
         <LayerGroup>
          <Pane name="signs" className={"signs"}>     
            <DefectPoints
              data = {faultSigns}
              onClick={handleMarkerClick}
            />
          </Pane>
         </LayerGroup>
         </LayersControl.Overlay>
         <LayersControl.Overlay checked name="Centrelines">
          <LayerGroup>
            <Centrelines data={centrelines}/>
          </LayerGroup>
        </LayersControl.Overlay>
          </LayersControl> 
          {trail.map((point, idx) =>
            <TrailMarker
              key={`trail=${idx}`}
              point={point}
            />
          )}  
          <Pane name="position">
          <Location className='location' data={position} style={{ zIndex: 1000 }}   ></Location>
        </Pane>
         </MapContainer> 
          </div> 
    </>  
  );
}

export default App;