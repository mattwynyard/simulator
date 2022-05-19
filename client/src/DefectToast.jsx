import { Toast } from 'react-bootstrap';

export function DefectToast(props) {

    return (
        <Toast
            className = {"toast"}
            show={false}
        >
            <Toast.Header>
            <strong>{`Fault: ${props.data.description}`}</strong><br></br>
            </Toast.Header>
            <Toast.Body>
            <div>
                {`Id: ${props.data.id}`}<br></br>
                {`Inspection: ${props.data.inspection}`}<br></br>
                {`Code: ${props.data.code}`}<br></br>
                {`Priority: ${props.data.priority}`}<br></br>
                {`Repair: ${props.data.repair}`}<br></br>
                {`Side: ${props.data.side}`}<br></br>
                {`Start: ${props.data.starterp} m`}<br></br>
                {`End: ${props.data.enderp} m`}<br></br>
                {`Length: ${props.data.length} m`}<br></br>
                {`Width: ${props.data.width} m`}<br></br>
                {`Count: ${props.data.count}`}<br></br>
                {`Inspector: ${props.data.inspector}`}<br></br>
                {`Photo: ${props.data.photo}`}<br></br>
                {`Timestamp: ${props.data.gpstime}`}<br></br>
                {`Lat: ${props.data.geojson[0]}`}<br></br> 
                {`Lng: ${props.data.geojson[1]}`}<br></br> 
            </div> 
            </Toast.Body>  
        </Toast>
    );
}