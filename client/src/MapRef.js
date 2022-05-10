import { useState, useEffect, useImperativeHandle, forwardRef, useCallback} from 'react';
import { useMapEvents, useMapEvent} from 'react-leaflet';
import './PositionControl';
import L from 'leaflet';

const MapRef = forwardRef((props, ref) => {
    const [center, setCenter] = useState(props.center ? props.center : null);
    const [control, setControl] = useState(null);

    const map = useMapEvents({
      click: (e) => {
        const position = e.latlng.lat + " " + e.latlng.lng
        navigator.clipboard.writeText(position);
        console.log(e.containerPoint)
      },
      moveend: (e) => {
        props.update(map.getBounds(), map.getCenter(), map.getZoom())

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
      control.updateHTML(lat, lng);

    }, [control, map]);

    useMapEvent('mousemove', onMouseMove)

    const newCenter = useCallback((center) => {
      setCenter(center);
    }, []);

    const getBounds = useCallback(() => {
        return map.getBounds();
    }, [map]);

    const setMinZoom = useCallback((zoom) => {
      map.setMinZoom(zoom)
    }, [map]);

    const setZoom = useCallback((zoom) => {
      map.setZoom(zoom)
    }, [map]);

    const getZoom = useCallback(() => {
      return(map.getZoom());
    }, []);

    const getCenter = useCallback(() => {
      return map.getCenter();
    }, []);

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
  
    useEffect(() => {
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