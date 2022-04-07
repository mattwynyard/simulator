import { useState, useEffect, useImperativeHandle, forwardRef} from 'react';
import { useMapEvents} from 'react-leaflet';

const MapRef = forwardRef((props, ref) => {
    const [center, setCenter] = useState(props.center ? props.center : null);

    const map = useMapEvents({
      click: () => {
        console.log("click")
      },
      zoom: () => {
      },
      move: () => {
      },
      zoomend: () => {
          console.log("zoomend")
    },
    });
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