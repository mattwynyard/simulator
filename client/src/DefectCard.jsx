import './DefectCard.css';

import {Table, Card, CloseButton} from 'react-bootstrap';

export function DefectCard(props) {

    const setColor = () => {
        if (props.data.priority === 1) {
            return 'box magenta';
        } else if (props.data.priority === 2) {
            return 'box orange'
        } else if (props.priority === 3) {
            return 'box green';
        }    
    }

    const handleClose  = () => {
        props.close();
    }

    if (props.show && props.data !== null) {
        return (
            <div className={props.show ? "fault-card-visible" : "fault-card-hidden"}
            >
            <Card
            >
                <Card.Header>
                    <div className={setColor()}/>
                    <strong>{`${props.data.description}`}</strong><br></br>
                    <CloseButton  
                        onClick={handleClose}
                    />       
                </Card.Header>
                <Card.Body>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>Id</th>
                        <th>Priority</th>
                        <th>Side</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>{props.data.id}</td>
                        <td>{props.data.priority}</td>
                        <td>{props.data.side}</td>
                        </tr>
                    </tbody>
                    </Table>
                {/* <div>
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
                </div>  */}
                </Card.Body>  
            </Card>
            </div>
        );
    } else {
        return null;
    }
    
}