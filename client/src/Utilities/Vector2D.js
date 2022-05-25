export default class Vector2D {

    constructor(x, y) {
        this.vector = [x, y]
    }

    subtract(v) {
        if (v instanceof Vector2D) {
            return new Vector2D (this.vector[0] - v.vector[0], this.vector[1] - v.vector[1]);
        } else {
			this.vector[0] -= v;
			this.vector[1] -= v;
            return this;
		}	
    }

    add(v) {
        if (v instanceof Vector2D) {
            return new Vector2D (this.vector[0] + v.vector[0], this.vector[1] + v.vector[1]);
        } else {
			this.vector[0] += v;
			this.vector[1] += v;
            return this;
		}	
    }

    multiply(b) {
        if (b instanceof Vector2D) {
            return new Vector2D(this.vector[0] * b.vector[0], this.vector[1] * b.vector[1]);
        } else {
            this.vector[0] *= b;
            this.vector[1] *= b
            return this;
        }   
	}

    magnitude() {
		return Math.sqrt((this.vector[0] * this.vector[0]) + (this.vector[1] * this.vector[1]));
	}

    normalise() {
        if (this.magnitude() === 0) {
            return new Vector2D(1, 1);
        } else {
            return new Vector2D(this.vector[0] / this.magnitude(), this.vector[1] / this.magnitude());
        }
        
    }

    tangent() {
        return new Vector2D(-this.vector[1], this.vector[0]);
    }

    dot(b) {
		return (this.vector[0] * b.vector[0]) + (this.vector[1] * b.vector[1]);
	}

    isEqual(v) {
        return this.vector[0] === v.vector[0] && this.vector[1] === v.vector[1];
    }
}