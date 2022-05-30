import './DefectCard.css';

import {Table, Card, CloseButton} from 'react-bootstrap';
import { useEffect } from 'react';

export function DefectCard(props) {

    const setColor = () => {
        if (props.data.priority === 1) {
            return 'box magenta';
        } else if (props.data.priority === 2) {
            return 'box orange'
        } else if (props.data.priority === 3) {
            return 'box green';
        } else {
            return 'box blue';
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
                <Card.Header className="header-card">
                    <div className={setColor()}/>
                    <strong className="heading-card">{`${props.data.description}`}</strong>
                    <CloseButton 
                    className="close-btn" 
                        onClick={handleClose}
                    />       
                </Card.Header>
                <Card.Body>
                <div>
                    {`Priority: ${props.data.priority}`}<br></br>
                    {`Side: ${props.data.side}`}<br></br>
                    {`Start: ${props.data.starterp} m`}<br></br>
                    {`End: ${props.data.enderp} m`}<br></br>
                    {`Length: ${props.data.length} m`}<br></br>
                    {`Width: ${props.data.width} m`}<br></br>
                    {`Count: ${props.data.count}`}<br></br>
                    {`Timestamp: ${props.data.gpstime}`}<br></br>
                </div> 
                </Card.Body>  
            </Card>
            </div>
        );
    } else {
        return null;
    }
    
}