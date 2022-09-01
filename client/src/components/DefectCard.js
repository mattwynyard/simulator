

export const DefectCardBody = (props) => {
    return (
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
    )
}

export const DefectCardHeader = (props) => {
    return (
        <div>
            <strong className="heading-card">{`${props.data.description}`}</strong>
                
        </div>
        
    )
}