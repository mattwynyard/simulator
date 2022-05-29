import Vector2D from "./Vector2D";

export default class Vector2DConsumer {

    constructor(x, y) {
        this.vector = new Vector2D(x, y)
    }
    
    add(v) {
        this.vector.add(v)
    }
}