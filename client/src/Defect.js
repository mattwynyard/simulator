import React from 'react';
import DefectCircle from './DefectCircle.js';
import DefectSquare from './DefectSquare.js';

export default function Defect(props) {
    if (props.data.shape === 'circle') {
        return (
            <DefectCircle data={props.data}/>
        );
    } else if (props.data.shape === 'square') {
        return (
            <DefectSquare data={props.data}/>
        );
    } else {
        return null
    }
       
}