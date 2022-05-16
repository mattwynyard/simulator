import Centreline from './Centreline.jsx';
import { useMap } from 'react-leaflet';
import { useMemo } from 'react';

const getLineWeight = (zoom) => {
    switch (zoom) {
        case 18:
            return 12;
        case 17:
            return 10;
        case 16:
            return 8;
        case 15:
            return 6;
        case 14:
            return 4;
        case 13:
            return 4;
        default:
            return 9;
    }
  }

export default function Centrelines(props) {
    const map = useMap();
    const zoom = map.getZoom();
    const weight = useMemo(() => getLineWeight(zoom), [zoom]);
    return (
        <>
        {props.data.map((line, idx) =>
            <Centreline
              className = {"centre-line"}
              key={line.cwid}    
              data={line}
              weight={weight}
            >           
            </Centreline>
          )}
        </>    
    );
}