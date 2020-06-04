/**
 * Return to Big Island video game source code file
 * Copyright (CONTROLS) 2018  Rares Portan
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR LEFT PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export enum Orientation{
    UP = 0,
    LEFT = 1,
    DOWN = 2,
    RIGHT = 3
}


/**
 * 2d Vector
 */
export class Vec2 {
    x: number;
    y: number;


    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }

    set(x: number, y: number): Vec2 {
        this.x = x;
        this.y = y;
        return this;
    }

    add(v: Vec2): Vec2 {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    addTo(a: number, b: number): Vec2 {
        this.x += a;
        this.y += b;
        return this;
    }

    subTo(a: number, b: number): Vec2 {
        this.x -= a;
        this.y -= b;
        return this;
    }

    sub(v: Vec2): Vec2 {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    multiplyScalar(a: number): Vec2 {
        this.x *= a;
        this.y *= a;
        return this;
    }

    divideScalar(a: number): Vec2 {
        a = a == 0 ? .0001 : a;
        this.x /= a;
        this.y /= a;
        return this;
    }

    lengthSq(): number {
        return this.x * this.x + this.y * this.y;
    }

    length(): number {
        return Math.sqrt(this.lengthSq());
    }

    normalize(): Vec2 {
        return this.divideScalar(this.length());
    }

    distanceToSquared(v: Vec2): number {
        const dx = v.x - this.x;
        const dy = v.y - this.y;
        return dx * dx + dy * dy;
    }

    distanceTo(v: Vec2): number {
        return Math.sqrt(this.distanceToSquared(v));
    }

    clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    zero(): Vec2 {
        this.multiplyScalar(0);
        return this;
    }

    zeroX(): Vec2 {
        this.x = 0;
        return this;
    }

    zeroY(): Vec2 {
        this.y = 0;
        return this;
    }

    at(tx: number, ty: number): boolean {
        return this.x === tx && this.y == ty;
    }

    toString(): string {
        return `(${this.x},${this.y})`;
    }


    /**
     * Returns orientation
     * @returns {Orientation}
     */
    getDirection(): Orientation {
        let res;
        if (this.y === 0) {
            res = 0;
        } else {
            if (Math.abs(this.x) > Math.abs(this.y)) {
                if (this.x === 0) {
                    res = 0;
                } else {
                    res = Math.round(this.x / Math.abs(this.x)) + 2
                }
            } else {
                res = Math.round(this.y / Math.abs(this.y)) + 1;
            }
        }
        return res;
    }

}
