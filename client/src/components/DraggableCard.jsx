import './DefectCard.css';
import {Card} from 'react-bootstrap';
import React, { useRef, useState} from 'react';


export function DragableCard(props) {

    const TOLERANCE = 50; //resize box pixels

    const cardRef = useRef(null);
    const [moving, setMoving] = useState(false);
    const [resize, setResize] = useState(false);
    const [mouseDown, setMouseDown] = useState(false)
    const [mousePosition, setMousePosition] = useState(null);
    //const [height, setHeight] = useState()

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

    const isMouseOverResize = (mouse, bottomRight) => { 
        if (mouse.x > bottomRight.x || mouse.y > bottomRight.y) return false;
        if (mouse.x >= bottomRight.x - TOLERANCE && mouse.y >= bottomRight.y - TOLERANCE) return true
        return false;
    }

    const mouseOverBody = (e) => {
        const card = cardRef.current;
        const rect = boundingRect(card)
        const result = isMouseOverResize({x: e.clientX, y: e.clientY}, rect.bottomRight);
        if (result && card) {
            setResize(true)
            card.style.cursor = 'se-resize';
        } 
        
    }

    const boundingRect = (card) => {
        const top = parseInt(card.style.top)
        const left = parseInt(card.style.left)
        return ({topLeft: {x: left, y: top}, bottomRight: {x: left + card.clientWidth, y: top + card.clientHeight}})
    }

    const mouseUpBody = (e) => {
        setMouseDown(false);
        setResize(false);
    }

    const mouseDownBody = (e) => {
        console.log("mouse down body")
        const card = cardRef.current;
        const rect = boundingRect(card);
        const result = isMouseOverResize({x: e.clientX, y: e.clientY}, rect.bottomRight)
        setMousePosition({x: e.clientX, y: e.clientY})
        console.log(result)
        if (result) {
            setResize(true);
            setMouseDown(true);
            
        } else {
            setResize(false);

        }
    }

    const mouseOverHeader = (e) => {
        const card = cardRef.current;
        card.style.cursor = 'pointer';
    }

    const mouseDownHeader = (e) => {
        const card = cardRef.current;
        if (card) {
            setMoving(true)
            card.style.cursor = 'move';
            setMousePosition({x: e.clientX, y: e.clientY})
        }
    }

    const mouseUpHeader = (e) => {
        const card = cardRef.current;
        if (moving) {
            setMoving(false)
            if (card) card.style.cursor = '';
        }
    }

    const onMouseMove = (e) => {
        const card = cardRef.current; 
        const newX = mousePosition.x - e.clientX;
        const newY = mousePosition.y - e.clientY;
        if (card) {
            if (mouseDown && card.style.cursor === 'se-resize') {

                card.style.width = card.clientWidth - newX + "px";
                card.style.height = card.clientHeight - newY+ "px";
                
            } 
            if (moving) {
                card.style.top = card.offsetTop - newY + "px";
                card.style.left = card.offsetLeft - newX + "px";
            }
            setMousePosition({x: e.clientX, y: e.clientY})
        }
           
    }

    const clickClose = (e) => {

    }

    if (props.show && props.data !== null) {
        return (
            <div 
                ref={cardRef}
                className={props.show ? "fault-card-visible" : "fault-card-hidden"}
            >
            <Card
                className="card"
                
            >
                <Card.Header 
                    className="card-header"
                    onMouseOver={(e) => mouseOverHeader(e)}
                    onMouseDown={(e) => mouseDownHeader(e)}
                    onMouseUp={(e) => mouseUpHeader(e)}
                    onMouseMove={moving  ? (e) =>  onMouseMove(e) : null}
                >
                    <div className={setColor()}/>
                    {props.header}
                </Card.Header>
                <Card.Body 
                    className="card-body"
                    onMouseOver={(e) => mouseOverBody(e)}
                    onMouseDown={(e) => mouseDownBody(e)}
                    onMouseUp={(e) => mouseUpBody(e)}
                    // onMouseMove={mouseDown ? (e) =>  onMouseMove(e) : null}
                    onMouseMove={(e) =>  onMouseMove(e)}
                >
                    {props.body}
                </Card.Body>  
            </Card>
            </div>
        );
    } else {
        return null;
    }
    
}