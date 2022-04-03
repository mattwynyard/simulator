import socketIOClient from "socket.io-client";
import { useState, useEffect } from 'react';
import L from 'leaflet';

const ENDPOINT = "http://localhost:5000";

function Socket(props) {

    useEffect(() => {
      const socket = socketIOClient(ENDPOINT, {
        cors: {
          origin: "http://localhost:8080",
          methods: ["GET", "POST"]
        }
      });
      socket.on("api", data => {
        console.log(data)
      });
      socket.on("reset", data => {
        props.reset();
      });
      socket.on("latlng", data => {
        props.setPosition([L.latLng(data[0], data[1])]); 
      });
      socket.on("insertPoint", data => {
        props.insertPoint(data);
      });
      socket.on("insertLine", data => {
        console.log(data)
        props.insertLine(data);
      });
      return () => socket.disconnect();   
    }, []);
    return null;
  }

  export default Socket;