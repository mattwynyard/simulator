export const buildSquare = (center, rotation, size) => {
    const p1 = [center.x - (0.5 * size * (Math.sin(rotation) + Math.cos(rotation))), center.y - (0.5 * size * (Math.sin(rotation) - Math.cos(rotation)))]
    const p2 = [center.x + (0.5 * size * (Math.sin(rotation) - Math.cos(rotation))), center.y - (0.5 * size * (Math.sin(rotation) + Math.cos(rotation)))]
    const p3 = [center.x + (0.5 * size * (Math.sin(rotation) + Math.cos(rotation))), center.y + (0.5 * size * (Math.sin(rotation) - Math.cos(rotation)))]
    const p4 = [center.x - (0.5 * size * (Math.sin(rotation) - Math.cos(rotation))), center.y + (0.5 * size * (Math.sin(rotation) + Math.cos(rotation)))]
    return [p1, p2, p3, p4]
}

export const buildLocationTriangle = (center, rotation, size) => {
    const points = [];
        const x0 = Math.round(center.x + (size * Math.cos((rotation * (Math.PI / 180)) * Math.PI / 3)));
        const y0 = Math.round(center.y + (size * Math.sin((rotation * (Math.PI / 180)) * Math.PI / 3)));
        const x1 = Math.round(center.x + (size * Math.cos((rotation * (Math.PI / 180)) + 2 * Math.PI / 3)));
        const y1 = Math.round(center.y + (size * Math.sin((rotation * (Math.PI / 180)) + 2 * Math.PI / 3)));
        const x2 = Math.round(center.x + (size * Math.cos((rotation * (Math.PI / 180)) + 4 * Math.PI / 3)));
        const y2 = Math.round(center.y + (size * Math.sin((rotation * (Math.PI / 180)) + 4 * Math.PI / 3)));
        points.push([x0, y0], [Math.round(center.x), Math.round(center.y)], [x1, y1], [x2, y2])
    return points;
}

export const buildTriangle = (center, rotation, size) => {
    const points = [];
    for (let i = 0; i < 3; i++) {
        const x = Math.round(center.x + (size * Math.cos((rotation * (Math.PI / 180)) + i * 2 * Math.PI / 3)));
        const y = Math.round(center.y + (size * Math.sin((rotation * (Math.PI / 180)) + i * 2 * Math.PI / 3)));
        points.push([x, y])
    }
    return points;
}

export const buildCross = (center, rotation, size) => {
    const outerSize = size * 2;
    const p1 = [center.x - (0.5 * size * (Math.sin(rotation) + Math.cos(rotation))), center.y - (1.5 * size * (Math.sin(rotation) - Math.cos(rotation)))]
    const p2 = [center.x - (0.5 * size * (Math.sin(rotation) + Math.cos(rotation))), center.y - (0.5 * size * (Math.sin(rotation) - Math.cos(rotation)))]
    const p3 = [center.x - (1.5 * size * (Math.sin(rotation) + Math.cos(rotation))), center.y - (0.5 * size * (Math.sin(rotation) - Math.cos(rotation)))]
    const p4 = [center.x + (1.5 * size * (Math.sin(rotation) - Math.cos(rotation))), center.y - (0.5 * size * (Math.sin(rotation) + Math.cos(rotation)))]
    const p5 = [center.x + (0.5 * size * (Math.sin(rotation) - Math.cos(rotation))), center.y - (0.5 * size * (Math.sin(rotation) + Math.cos(rotation)))]
    const p6 = [center.x + (0.5 * size * (Math.sin(rotation) - Math.cos(rotation))), center.y - (1.5 * size * (Math.sin(rotation) + Math.cos(rotation)))]
    const p7 = [center.x + (0.5 * size * (Math.sin(rotation) + Math.cos(rotation))), center.y + (1.5 * size * (Math.sin(rotation) - Math.cos(rotation)))]
    const p8 = [center.x + (0.5 * size * (Math.sin(rotation) + Math.cos(rotation))), center.y + (0.5 * size * (Math.sin(rotation) - Math.cos(rotation)))]
    const p9 = [center.x + (1.5 * size * (Math.sin(rotation) + Math.cos(rotation))), center.y + (0.5 * size * (Math.sin(rotation) - Math.cos(rotation)))]
    const p10 = [center.x - (1.5 * size * (Math.sin(rotation) - Math.cos(rotation))), center.y + (0.5 * size * (Math.sin(rotation) + Math.cos(rotation)))]
    const p11 = [center.x - (0.5 * size * (Math.sin(rotation) - Math.cos(rotation))), center.y + (0.5 * size * (Math.sin(rotation) + Math.cos(rotation)))]
    const p12 = [center.x - (0.5 * size * (Math.sin(rotation) - Math.cos(rotation))), center.y + (1.5 * size * (Math.sin(rotation) + Math.cos(rotation)))]

    return [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12]
}

export const buildStar = (center, outerRadius, numPoints=4) => {
    const points = [];
    const innerRadius = outerRadius / 2;
    const rotate = 29.9;
    const angle = 2 * Math.PI / numPoints;
    const draw = (radius, angle) => {
        const x = center.x + radius * Math.cos(angle);
        const y = center.y + radius * Math.sin(angle); 
        return [x, y];
    }
    for (let i = 0; i <= numPoints; i++) {
        const outerAngle = i * angle + rotate;
        const innerAngle = outerAngle + angle / 2;
        const outerPoint = draw(outerRadius, outerAngle);
        points.push(outerPoint)
        const innerPoint = draw(innerRadius, innerAngle);
        points.push(innerPoint);
    }
    return points;
}