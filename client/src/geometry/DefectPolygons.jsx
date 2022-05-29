import { useMap, Polygon} from 'react-leaflet';
import { getColor, getLineWeight} from '../Utilities/Geometry.js';
import { DefectPopup } from '../DefectPopup.js';
import { useMemo } from 'react';
import Vector2D from '../Utilities/Vector2D.js';
import L from 'leaflet';

const buildSimplePolygon = (vectors, thickness) => {
    const line = vectors[1].subtract(vectors[0]);
    const normal = line.normalise();
    const offset = normal.tangent().multiply(thickness);
    const point0 = vectors[0].subtract(offset)
    const point1 = vectors[0].add(offset);
    const point2 = vectors[1].add(offset);
    const point3 = vectors[1].subtract(offset);        
    return [point0, point1, point2, point3]
}

const buildComplexPolygon = (vectors, thickness, id) => {
    //if (id === 300400120) {
        const pointsA = [];
        const pointsB = [];
        const line0 = vectors[1].subtract(vectors[0]);
        const normal0 = line0.normalise();
        const offset0 = normal0.tangent().multiply(thickness);
        const pointA0 = vectors[0].subtract(offset0);
        const pointB0 = vectors[0].add(offset0);  
        pointsA.push(pointA0);
        pointsB.push(pointB0);
        for (let i = 1; i < vectors.length - 1; i++) {  
            const lineA = vectors[i].subtract(vectors[i - 1]).normalise();
            const lineB = vectors[i + 1].subtract(vectors[i]).normalise();
            const tangent = lineA.add(lineB).normalise();
            const miter = tangent.tangent();
            const normal  = lineA.tangent();
            const dotProduct = miter.dot(normal)
            const length = thickness / (dotProduct);
            const offset = miter.multiply(length);
            const pointA = vectors[i].subtract(offset);
            const pointB = vectors[i].add(offset);
            pointsA.push(pointA);
            pointsB.push(pointB);    
        }
        const lineN = vectors[vectors.length - 1].subtract(vectors[vectors.length - 2])
        const normalN = lineN.normalise();
        const offsetN = normalN.tangent().multiply(thickness);
        const pointAN = vectors[vectors.length - 1].subtract(offsetN)
        const pointBN = vectors[vectors.length - 1].add(offsetN);
        pointsA.push(pointAN)
        pointsB.push(pointBN)
        const points  = pointsA.concat(pointsB.reverse());
        return points;
    // } else {
    //     return null
    // }
    
}

const DefectPolygon = (props) => {
    const color = useMemo(() => getColor(props.data.priority), [props.data.priority]);
    const map = useMap();
    const zoom = map.getZoom();
    const thickness = useMemo(() => getLineWeight(zoom), [zoom]);
    const vectors = [];
    const latlngs = [];
    props.data.geojson.forEach(point => {
        const spherical = L.CRS.EPSG3857.latLngToPoint(L.latLng(point), zoom)
        const vector = new Vector2D(spherical.x, spherical.y)
        vectors.push(vector);
    });
    let xyVectors = null;
    if (vectors.length === 2) {
        xyVectors = buildSimplePolygon(vectors, thickness);
    } else if (vectors.length > 2) {
        xyVectors = buildComplexPolygon(vectors, thickness, props.data.id);
    }
    if (xyVectors) {
        xyVectors.forEach((vector) => {
            try {
                const origin = map.getPixelOrigin();
                const layerPoint = [vector.vector[0] - origin.x, vector.vector[1] - origin.y];
                const latlng = map.layerPointToLatLng(layerPoint);
                latlngs.push(latlng);
            } catch (err) {
                console.log(`Error: ${props.data.id}`);
            }
        });
    }
    if (latlngs) {
        return (
            <Polygon 
                positions={latlngs}
                pathOptions={{color: "#000000"}}
                stroke={true}
                weight={zoom >= 18 ? 2 : 1}
                opacity={1.0}
                fillColor={color}
                fillOpacity={1.0}
                eventHandlers={{
                    click: (e) => {
                        e.target.openPopup();
                    },
                }}
                > 
                <DefectPopup data ={props.data}/>           
            </Polygon>
        );
    } else {
        return null;
    }  
}

export default function DefectPolygons(props) {
    return (
        <>
        {props.data.map((defect) =>
            <DefectPolygon
              data={defect}
              key={defect.id}
              id={defect.id}
            />
            )} 
        </>
    );

}