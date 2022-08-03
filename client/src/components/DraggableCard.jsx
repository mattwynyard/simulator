import './DefectCard.css';
import {Card, CloseButton} from 'react-bootstrap';
import React, { useRef, useState} from 'react';


export function DragableCard(props) {

    const cardRef = useRef(null);
    const [moving, setMoving] = useState(false)
    const [mousePosition, setMousePosition] = useState(null)

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

    const mouseEnterHeader = (e) => {
        const card = cardRef.current;
        card.style.cursor = 'pointer';
    }

    const mouseLeaveHeader = (e) => {
        mouseUpHeader(e);
    }

    const mouseDownHeader = (e) => {
        const card = cardRef.current;
        setMoving(true)
        card.style.cursor = 'pointer';
        setMousePosition({x: e.clientX, y: e.clientY})
        console.log("mouse down header")
    }

    const mouseUpHeader = (e) => {
        const card = cardRef.current;
        if (setMoving) {
            setMoving(false)
            card.style.cursor = '';
        }
        console.log("mouse up header")
    }

    const onMouseMove = (e) => {
        const card = cardRef.current;
        const newX = mousePosition.x - e.clientX;
        const newY = mousePosition.y - e.clientY;
        setMousePosition({x: e.clientX, y: e.clientY})
        card.style.top = card.offsetTop - newY + "px";;
        card.style.left = card.offsetLeft - newX + "px";
    }

    if (props.show && props.data !== null) {
        return (
            <div 
                ref={cardRef}
                className={props.show ? "fault-card-visible" : "fault-card-hidden"}
            >
            <Card
            >
                <Card.Header 
                    className="card-header"
                    onMouseLeave={(e) => mouseLeaveHeader(e)}
                    onMouseEnter={(e) => mouseEnterHeader(e)}
                    onMouseDown={(e) => mouseDownHeader(e)}
                    onMouseUp={(e) => mouseUpHeader(e)}
                    onMouseMove={moving ? (e) =>  onMouseMove(e) : null}
                >
                    <div className={setColor()}/>
                    {props.header}
                </Card.Header>
                <Card.Body >
                    {props.body}
                </Card.Body>  
            </Card>
            </div>
        );
    } else {
        return null;
    }
    
}