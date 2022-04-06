import { useState, useEffect, useImperativeHandle, forwardRef} from 'react';
import { useMapEvents} from 'react-leaflet';

const MapRef = forwardRef((props, ref) => {
    const [center, setCenter] = useState(props.center[0] ? props.center[0] : null);
    const [bounds, setBounds] = useState(null);

    const map = useMapEvents({
      click: () => {
        console.log("click")
      },
      zoom: () => {
        let mapBounds = map.getBounds();
        setBounds(mapBounds);
      },
      move: () => {
        let mapBounds = map.getBounds();
        setBounds(mapBounds);
      },
    })
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
          map.panTo(center)
        }
        let mapBounds = map.getBounds();
        setBounds(mapBounds);      
    }, [center, map]);

    return null
});

export default MapRef;