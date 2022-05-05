export const buildSquare = (center, rotation, size) => {
    const p1 = [center.x - (0.5 * size * (Math.sin(rotation) + Math.cos(rotation))), center.y - (0.5 * size * (Math.sin(rotation) - Math.cos(rotation)))]
    const p2 = [center.x + (0.5 * size * (Math.sin(rotation) - Math.cos(rotation))), center.y - (0.5 * size * (Math.sin(rotation) + Math.cos(rotation)))]
    const p3 = [center.x + (0.5 * size * (Math.sin(rotation) + Math.cos(rotation))), center.y + (0.5 * size * (Math.sin(rotation) - Math.cos(rotation)))]
    const p4 = [center.x - (0.5 * size * (Math.sin(rotation) - Math.cos(rotation))), center.y + (0.5 * size * (Math.sin(rotation) + Math.cos(rotation)))]
    return [p1, p2, p3, p4]
}

export const buildTriangle = (center, rotation, size) => {
    let points = []
    for (let i = 0; i < 3; i++) {
        const x = Math.round(center.x + (size * Math.cos((rotation * (Math.PI / 180)) + i * 2 * Math.PI / 3)));
        const y = Math.round(center.y + (size * Math.sin((rotation * (Math.PI / 180)) + i * 2 * Math.PI / 3)));
        points.push([x, y])
    }
    return points;
}