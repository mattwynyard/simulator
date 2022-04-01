import socketIOClient from "socket.io-client";
import { useEffect } from 'react';
import L from 'leaflet';

const ENDPOINT = "http://localhost:5000";

const Socket = (props) => {

    const {updateLines, setPosition, insertLine, reset, insertPoint, updateCentrelines} = props;

    useEffect(() => {
      const socket = socketIOClient(ENDPOINT, {
        cors: {
          origin: "http://localhost:8080",
          methods: ["GET", "POST"]
        }
      });
      socket.on("connect", () => {
        console.log("connect");
        socket.sendBuffer = []; 
        socket.on("reset", () => {
            reset();
          });
          socket.on("latlng", data => {
            setPosition([L.latLng(data[0], data[1])]); 
          });
          socket.on("insertPoint", data => {
            insertPoint(data);
          });
          socket.on("insertLine", data => {
            insertLine(data);
          });
          socket.on("updateLine", data => {
            updateLines(data);
          });
          socket.on("centreline", data => {
            updateCentrelines(data);
          });
      });
      return () => socket.disconnect();   
    }, []);
    return null;
  }

  export default Socket;