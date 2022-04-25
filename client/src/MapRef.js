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
        //props.update(map.getBounds(), map.getCenter())
      },
      moveend: (e) => {
        props.update(map.getBounds(), map.getCenter(), map.getZoom())

      },
      zoomstart: (e) => {
        //console.log("zoom start")
        //props.update()
      },
      zoomend: (e) => {
        //console.log("zoom end")
        //props.update(map.getBounds(), map.getCenter()) 
      }
    }, []);

    useEffect(
      () => {
        let control = L.positionControl()
        map.addControl(control);
        setControl(control)
    }, [map]);

    const onMouseMove  = useCallback((e) => {
      let lat = e.latlng.lat ? Math.round(e.latlng.lat * 100000) / 100000 :  map.getCenter().lat;
      let lng = e.latlng.lat ? Math.round(e.latlng.lng * 100000) / 100000 :  map.getCenter().lng;
      control.updateHTML(lat, lng)
    }, [control, map]);

    useMapEvent('mousemove', onMouseMove)

    const newCenter = (center) => {
      setCenter(center);
    };

    const getBounds = () => {
        return map.getBounds();
    };

    const setMinZoom = (zoom) => {
      map.setMinZoom(zoom)
    };

    const setZoom = (zoom) => {
      map.setZoom(zoom)
    };

    const getZoom = () => {
      return(map.getZoom());
    };

    const getCenter = () => {
      return map.getCenter();
    };

    const flyTo = (center, zoom) => {
      map.flyTo(center, zoom);
    }

    useImperativeHandle(ref, () => {
      return {
        newCenter: newCenter,
        getBounds : getBounds,
        getCenter : getCenter,
        setMinZoom: setMinZoom,
        setZoom: setZoom,
        getZoom: getZoom,
        flyTo: flyTo
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