import { useState, useEffect} from 'react';
import { useMap} from 'react-leaflet';

const MapRef = (props) => {
    const [center, setCenter] = useState(props.center[0] ? props.center[0] : null);
    const map = useMap();

    useEffect(
      () => {
        if (center) {
          map.panTo(center)
        }    
    }, [center, map]);

    return null
}

export default MapRef;