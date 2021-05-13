import './App.css';
import AntDrawer from'./AntDrawer.js'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, ScaleControl, useMap, useMapEvents, Pane} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef} from 'react';

function Centreline(props) {
  const redOptions = { color: 'red' }
  let otherOptions = null;
  let geojson = JSON.parse(props.positions.geojson);
  let coords = []
  geojson.coordinates.forEach(element => {
      element.forEach(coord => {
        let temp = coord[0];
        coord[0] = coord[1];
        coord[1] = temp;
        coords.push(coord)
      });     
  });
    if(props.idx % 2 === 0) {
        otherOptions = { color: 'orange' }
    } else {
      otherOptions = { color: 'blue' }
    } 
  //console.log(coords)
  return ( <Polyline
      key={`marker-${props.idx}`} 
      pathOptions={(props.idx === 0) ? redOptions: otherOptions}
      positions={coords} 
      weight={3}
      >
    </Polyline>);
}

const MapRef = forwardRef((props, ref) => {
  const [center, setCenter] = useState(null);
  const [bounds, setBounds] = useState(null);
  const map = useMapEvents({
    click: () => {
      console.log("click")
    },
    zoom: () => {
      let mapBounds = map.getBounds();
      setBounds(mapBounds);
      setCenter(center);
      if(center !== null) {
        props.callback(mapBounds, center);
      }
    },
  })
  const newCenter = (center) => {
    let mapBounds = map.getBounds();
    setBounds(mapBounds);
    setCenter(center);
  };
  useImperativeHandle(ref, () => {
    return {
      newCenter: newCenter
    }
 });

  useEffect(
    () => {
      //console.log(props.center);
      if (props.center.length !== 0) {
        map.panTo(props.center[0])
      }
      if(center !== null) {
        props.callback(bounds, center);
      }
      
    }, [center]);
    
    return null
  });

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
  const [centrelines, setCentreLines] = useState([]);
  const [host] = useState("localhost:5000");
  const [timerInterval] = useState(500);
  const mapRef = useRef(null);

  const getData = useCallback(async () => {      
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
            return body; 
        } else {
            
            return Error(response);
        }
    } catch {
        return new Error("connection error")
    }      
  }, [host]);

  const getClosestCentreline = async (center)=> {
    try {
      const response = await fetch("http://localhost:5000/closestCentreline", {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',        
          },  
          body: JSON.stringify({
            center: center
        })    
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
          //console.log(body);
          let fp = []
          for (let i = 0; i < body.data.length; i++) {
              fp.push(body.data[i])
              //console.log(body.data[i])
          }
          setCentreLines(fp)
          return body; 
      } else {
          
          return Error(response);
      }
  } catch {
      return new Error("connection error")
  }      
  }

  useEffect(
    () => {
        const id = setInterval(() => {
          setCounter(counter + 1);
          if (!initialise) { 
            setCenter([L.latLng(center[0], center[1])]);
            setPosition([L.latLng(center[0], center[1])]);
            mapRef.current.newCenter({lat: center[0], lng: center[1]})
            setIntialise(true);
          }
          getData().then(data => {
            if (data.points) {
              try {
                  setPoints(data.points); 
                  console.log(data)     
              } catch (e) {
                console.log("fault error: " + e)
              } 
            }
            if (data.lines) {
              try {
                  //console.log(data.lines);
                  setLines(data.lines);      
              } catch (e) {
                console.log("fault error: " + e)
              } 
            }   
            if (data.latlng) {
              try{
                let lat = data.latlng[0];
                let lng = data.latlng[1];
                setPosition([L.latLng(lat, lng)]);
                
              } catch {
                console.log("position error");
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
      if(mapRef.current !== null) {
        mapRef.current.newCenter(position[0])
      }      
    } else {
      getClosestCentreline(position);
    }
  },
  [position, counter, mapRef],
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
         </Pane >
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
          
          
          <MapRef ref={mapRef} center={center} callback={getCentrelines}></MapRef>  
         </MapContainer>
         <AntDrawer className="drawer" ></AntDrawer>
         
    </div>
  );
}

export default App;
