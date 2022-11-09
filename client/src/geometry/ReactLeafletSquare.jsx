import L from 'leaflet';
import { useLeafletContext } from '@react-leaflet/core';
import { useEffect, useRef} from 'react';

function getBounds(props) {
    console.log(props)
    return L.latLng(props.data.geojson).toBounds(props.size);
}

export const ReactLeafletSquare = (props) => {
    const context = useLeafletContext();
    const squareRef = useRef();
    const propsRef = useRef(props);
    useEffect(() => {
        squareRef.current = new L.Rectangle(getBounds(props))
        const container = context.layerContainer || context.map
        container.addLayer(squareRef.current)
    
        return () => {
          container.removeLayer(squareRef.current)
        }
      }, [])
    
    useEffect(() => {
    if (
        props.center !== propsRef.current.center ||
        props.size !== propsRef.current.size
    ) {
        squareRef.current.setBounds(getBounds(props))
    }
    propsRef.current = props
    }, [props.center, props.size])
    
    return null
}