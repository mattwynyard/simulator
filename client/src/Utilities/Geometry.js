export const getPointRadius = (zoom) => {
    switch (zoom) {
        case 18:
            return 6;
        case 17:
            return 5;
        case 16:
            return 4;
        case 15:
            return 3;
        case 14:
            return 2;
        case 13:
            return 1;
        default:
            return 3;
    }
}

export const getLineWeight = (zoom) => {
    switch (zoom) {
        case 18:
            return 6;
        case 17:
            return 4;
        case 16:
            return 3;
        case 15:
            return 2;
        case 14:
            return 1;
        case 13:
            return 0.5;
        default:
            return 4;
    }
}

export const getColor = (priority) => {
    if (priority === 1) {
        return "#EE00EE";
    } else if (priority === 2) {
        return "#DD7500";	 
    } else if (priority === 3) {
        return "#00CD00";
    } else {
        return "#000000";
    }
}

