import { useState, useEffect, useImperativeHandle, forwardRef, useCallback} from 'react';
import { useMapEvents, useMapEvent} from 'react-leaflet';
import './PositionControl';
import L from 'leaflet';

const MapRef = forwardRef((props, ref) => {
    const [center, setCenter] = useState(props.center ? props.center : null);
    const [control, setControl] = useState(null);

    const map = useMapEvents({
      click: () => {
        console.log("click")
      },
      zoom: (e) => {
        //console.log("zoom")
      },
      move: (e) => {
        //console.log("move")
        // let lat = Math.round(e.latlng.lat * 100000) / 100000;
        // let lng = Math.round(e.latlng.lng * 100000) / 100000;
      },
      movend: (e) => {
        //console.log("movend")
      },
      zoomend: (e) => {
        props.update()
      }
    }, []);

    useEffect(
      () => {
        let control = L.positionControl()
        map.addControl(control);
        setControl(control)
    }, [map]);

    const onMouseMove  = useCallback((e) => {
      let lat = Math.round(e.latlng.lat * 100000) / 100000;
      let lng = Math.round(e.latlng.lng * 100000) / 100000;
      control.updateHTML(lat, lng)
    }, [control]);

    useMapEvent('mousemove', onMouseMove)

    const newCenter = (center) => {
      setCenter(center);
    };

    const getBounds = () => {
        return map.getBounds();
      };

    useImperativeHandle(ref, () => {
      return {
        newCenter: newCenter,
        getBounds : getBounds
      }
    });
  
    useEffect(
      () => {
        if (center) {
          try {
              map.panTo(center)
          } catch(err) {
              console.log(err)
          }
        }     
    }, [center, map]);

    return null
});

export default MapRef;