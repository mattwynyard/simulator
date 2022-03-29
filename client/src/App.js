import './App.css';
import AntDrawer from'./AntDrawer.js'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, ScaleControl, useMap, useMapEvents, Pane} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useCallback, useRef, useImperativeHandle, forwardRef} from 'react';
import Centreline from './Centreline.js';
import CustomTileLayer from './CustomTileLayer.js';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:5000";

const REFRESH_RATE = 500;

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
      if (center) {
        console.log(center)
      }
      if(bounds !== null) {
        props.callback(bounds, center);
      }      
    }, [center]);
    
    return null
  });

// function LMap() {
//   const map = useMap();
//   useEffect(
//     () => {
//       console.log("mount");
//   }, []);
//   return null;
// }



function App() {

  const [counter, setCounter] = useState(0);
  const [initialise, setIntialise] = useState(false);
  const [isRemote] = useState(false);
  const [position, setPosition] = useState([]);
  const [center, setCenter] = useState([-36.81835, 174.74581]);
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [centrelines, setCentreLines] = useState([]);
  const [timerInterval] = useState(REFRESH_RATE);
  const mapRef = useRef(null);

  useEffect(
    () => {
      const socket = socketIOClient(ENDPOINT, {
        cors: {
          origin: "http://localhost:8080",
          methods: ["GET", "POST"]
        }
      });
      socket.on("connection", data => {
        console.log(data)
      });
      const initialise = async () => {
        try {
          const response = await fetch("http://localhost:5000/position", {
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
            return {error: "server down"}
        }
      }
      initialise()
      .then((res) => {
        if (res.error) {
          alert(res.error);
          return;
        }
        
        setIntialise(true)      
      })
      .catch(console.error); 
      //return () => socket.disconnect();   
  }, []);

  useEffect(() => {
    let lat = center[0];;
    let lng = center[1];
    setPosition([L.latLng(lat, lng)]); 
  }, [initialise])

  useEffect(() => {
    console.log("position: " + position)
  }, [position])

  


  // const getData = useCallback(async () => {      
  //   try {
  //       const response = await fetch("http://localhost:5000/position", {
  //           method: 'GET',
  //           credentials: 'same-origin',
  //           headers: {
  //               'Accept': 'application/json',
  //               'Content-Type': 'application/json',        
  //           },      
  //       });
  //       if (response.ok) {
  //           const body = await response.json();
  //           return body; 
  //       } else { 
  //           return Error(response);
  //       }
  //   } catch {
  //       return new Error("connection error")
  //   }      
  // }, [host]);

  

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
          let fp = []
          for (let i = 0; i < body.data.length; i++) {
              fp.push(body.data[i])
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

//   useEffect(
//     () => {
//         const id = setInterval(() => {
//           setCounter(counter + 1);
//           if (!initialise) { 
//             setCenter([L.latLng(center[0], center[1])]);
//             setPosition([L.latLng(center[0], center[1])]);
//             mapRef.current.newCenter({lat: center[0], lng: center[1]})
//             setIntialise(true);
//           }
//           getData().then(data => {
//             if (data.points) {
//               try {
//                   setPoints(data.points); 
//                   console.log(data)     
//               } catch (e) {
//                 console.log("fault error: " + e)
//               } 
//             }
//             if (data.lines) {
//               try {
//                   setLines(data.lines);      
//               } catch (e) {
//                 console.log("fault error: " + e)
//               } 
//             }   
//             if (data.latlng) {
//               try{
//                 let lat = data.latlng[0];
//                 let lng = data.latlng[1];
//                 setPosition([L.latLng(lat, lng)]);             
//               } catch {
//                 console.log("position error");
//               }     
//             }             
//           });
//         }, timerInterval);
//         return () => {
//           clearInterval(id);
//         };
//     },
//     [counter, timerInterval, initialise, getData],
// );

// useEffect(
//   () => {
//     if (counter % 10 === 0) {
//       setCenter(position);
//       if(mapRef.current !== null) {
//         mapRef.current.newCenter(position[0])
//       }      
//     } else {
//       getClosestCentreline(position);
//     }
//   },
//   [position, counter, mapRef],
// );

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
