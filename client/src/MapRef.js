import { useState, useEffect, useImperativeHandle, forwardRef} from 'react';
import { useMapEvents} from 'react-leaflet';

const MapRef = forwardRef((props, ref) => {
    const [center, setCenter] = useState(null);
    const [bounds, setBounds] = useState(null);

    const getCentrelines = props.getCentrelines;
    const initalCenter = props.center[0];
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
          map.panTo(initalCenter)
        }
        if(bounds) {
          getCentrelines(bounds, center);
        }      
      }, [center]);
      return null
    });

    export default MapRef;